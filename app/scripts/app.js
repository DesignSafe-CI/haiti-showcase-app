/*globals window, jQuery, console, google*/
/*eslint quotes:0, key-spacing:0, no-multi-spaces:0, comma-spacing:0, space-infix-ops:0, no-underscore-dangle:0, no-loop-func:1, eqeqeq:1, no-trailing-spaces:1*/
/*
    Showcase application using the Haiti Priority Index information.
    We'll be calling the adama service /walter-dev/haiti_v0.1 .
    Building model:
    {
        Ace  [ft²]: "33"
        - Building: "A001"
        - Captive  Columns: "Y"
        - Column Area  [ft²]: "67"
        - Column Index  [%]: "0.17"
        - Concrete Wall  Area E-W [ft²]: "0"
        - Concrete Wall  Area N-S [ft²]: "0"
        Date: "26-Jun"
        Diagram: "https://nees.org/site/collections/haiti/Diagrams/A001-Diagram.pdf"
        - Effective  Wall Area: "0"
        - First Floor Area  [ft²]: "9661"
        Latitude: 18.554472222222223
        Longitude: -72.3033611111111
        - Masonry Wall  Area E-W [ft²]: "102"
        - Masonry Wall  Area N-S [ft²]: "0"
        - Masonry Wall  Damage: "Severe"
        Notes: "Pic. 1544 for arch. Detail on E. side/ ~2" mortar cover on bldg. cols."
        - Number: "1"
        - Number of  Floors: "2"
        - Permenant  Drift: "N"
        Photographer: "Steeve"
        Pictures: "https://nees.org/site/collections/haiti/mainpics/A001.JPG"
        - Priority Index  [%]: "0.17"
        - Reinforced  Concrete Damage: "Severe"
        - Roof  Type: "Concrete"
        - Team: "A"
        - Total Floor Area  [ft²]: "19321"
        - Wall Index  [%]: "0"
    }
*/
var HPI = (function(window, $) {
    "use strict";

    //var appContext = $("[data-app-name=\"haiti-priority-index-app\"]");
    var App = {};
    App.config = {
            "baseNS": {"namespace": "walter-dev", "service": "haiti_v0.1" },
            "appContext": $("[data-app-name=\"haiti-priority-index-app\"]")
        };
    App.markers = {};

    var _closeMD = function(e){
        e.preventDefault();
        var row = $(this).parent().parent();
        row.hide("300");
        row.remove();
    };

    var _buildingToggleMD = function(e){
        e.preventDefault();
        var p = $(this).parent().parent();
        var bn = p.attr("data-building");
        var row = p.parent().find(".app-metadata." + bn);
        if(row.length > 0 ){
            row.hide("300");
            row.remove();
            return;
        }
        var md = App.config.appContext.find(".haiti-listing-metadata div[data-building=\"" + bn + "\"]").clone();
        row = $("<tr class=\"app-metadata " + bn + "\"><td colspan=\"19\"></td></tr>");
        var a = $("<a href=\"#\"><span class=\"close-icon glypicon-remove\"></span></a>");
        a.click(_closeMD);
        row.find("td").append(a);
        row.find("td").append(md);
        row.hide();
        p.after(row);
        row.show("300");
    };

    var _showMarker = function(e){
        e.preventDefault();
        var p = $(this).parent().parent();
        var bn = p.attr("data-building");
        var m = App.markers[bn];
        var el = $(".haiti-gmap");
        m.setAnimation(google.maps.Animation.BOUNCE);
        $('html, body').animate({
            scrollTop: el.offset().top - 30
        });
        google.maps.event.trigger(m, 'click');
        App.map.setCenter(m.getPosition());
        App.map.setZoom(18);
        setTimeout(function(){
            m.setAnimation(null);
        }, 2500);
    };

    var _createRow = function(obj, i){
        var st1 = $("<table class=\"table table-condensed \"><tbody></tbody></table");
        var st2 = $("<table class=\"table table-condensed\"><tbody></tbody></table");
        var row = $("<tr data-building = \"" + obj.Building + "\" data-index=\"" + i + "\">" +
                    "<td class=\"bname\"></td>" +
                    "<td>" + obj["Number"] + "</td>" +
                    "<td>" + obj["Number of  Floors"] + "</td>" +
                    "<td>" + obj["Total Floor Area  [ft\u00b2]"] + "</td>" +
                    "<td>" + obj["First Floor Area  [ft\u00b2]"] + "</td>" +
                    "<td>" + obj["Roof  Type"] + "</td>" +
                    "<td>" + obj["Captive  Columns"] + "</td>" +
                    "<td class=\"cwa subtable\"></td>" +
                    "<td>" + obj["Reinforced  Concrete Damage"] + "</td>" +
                    "<td class=\"mwa subtable\"></td>" +
                    "<td>" + obj["Masonry Wall  Damage"] + "</td>" +
                    "<td>" + obj["Column Area  [ft\u00b2]"] +  "</td>" +
                    "<td>" + obj["Effective  Wall Area"] + "</td>" +
                    "<td>" + obj["Ace  [ft\u00b2]"] + "</td>" +
                    "<td>" + obj["Permenant  Drift"] + "</td>" +
                    "<td>" + obj["Column Index  [%]"] + "</td>" +
                    "<td>" + obj["Wall Index  [%]"] + "</td>" +
                    "<td>" + obj["Priority Index  [%]"] + "</td>" +
                    "<td>" + obj["Team"] + "</td>" +
                    "</tr>");

        var ga = $("<a href=\"#\"><span class=\"glyphicon glyphicon-globe\"></span></a>");
        ga.click(_showMarker);
        row.find(".bname").append(ga);

        var a = $("<a href=\"#\">" + obj.Building + "</a>");
        a.click(_buildingToggleMD);
        row.find(".bname").append(a);

        st1.find("tbody").append("<tr>" +
                    "<td>" + obj["Concrete Wall  Area E-W [ft\u00b2]"] + "</td>" +
                    "</tr><tr>" +
                    "<td>" + obj["Concrete Wall  Area N-S [ft\u00b2]"] + "</td>" +
                "</tr>");
        row.find(".cwa").append(st1);
        st2.find("tbody").append("<tr>" +
                    "<td>" + obj["Masonry Wall  Area E-W [ft\u00b2]"] + "</td>" +
                    "</tr><tr>" +
                    "<td>" + obj["Masonry Wall  Area N-S [ft\u00b2]"] + "</td>" +
                "</tr>");
        row.find(".mwa").append(st2);
        return row;
    };

    var _createMetadata = function(obj){
        var div = $("<div data-building=\"" + obj.Building + "\">" +
                "<ul class=\"app-list\">" +
                    "<li><b>Date</b></li>" +
                    "<li>" + obj["Date"] + "</li>" +
                    "<li><b>Lat</b></li>" +
                    "<li>" + obj["Latitude"] + "</li>" +
                    "<li><b>Lon</b></li>" +
                    "<li>" + obj["Longitude"] + "</li>" +
                    "<li><b>Notes</b></li>" +
                    "<li>" + obj["Notes"] + "</li>" +
                    "<li><b>Photographer</b></li>" +
                    "<li>" + obj["Photographer"] + "</li>" +
            "</div>");
        var pics = obj["Pictures"].split(",");
        var path;
        var ul = div.find("ul");
        for(var i = 0; i < pics.length; i++){
            path = pics[i].split("/");
            ul.append("<li><a target=\"_blank\" href=\"" + pics[i] + "\">" + path[path.length - 1] + "</a></li>");
        }
        var digs = obj["Diagram"].split(",");
        for(var i = 0; i < pics.length; i++){
            path = digs[i].split("/");
            ul.append("<li><a target=\"_blank\" href=\"" + digs[i] + "\">" + path[path.length - 1] + "</a></li>");
        }
        return div;
    };

    var _appendPager = function(table, pager){
        var row = $(".app-pager-row", table);
        var cell;
        var append = false;
        if(row.length <= 0){
            row = $("<tr class=\"app-pager-row\"></tr>");
            cell = $("<td colspan=\"19\"></td>");
            row.append(cell);
            append = true;
        }else{
            cell = $("td", row);
        }
        cell.append(pager);
        if(append){
            table.append(row);
        }
        row.show();
    };

    var _showPage = function(table, objs, pageLength, curPage, page){
        var trs = $("> tbody > tr", table);
        trs.hide();
        var tr;
        for(var i = (page - 1) * pageLength; i < ((page - 1) * pageLength + pageLength) && i < (page * pageLength); i++){
            tr = $(trs[i]);
            tr.show();
        }
        curPage = +page;
        $(".app-pager", table).remove();
        var ul = _createPager(table, objs, pageLength, curPage);
        _appendPager(table, ul);
    };

    var _createPager = function(table, objs, pageLength, curPage){
        var pages = Math.ceil(objs.length / pageLength);
        var ul = $("<ul class=\"app-pager\"></ul>");

        if(pages < 2){ return ul; }

        ul.append("<li><a href=\"previous\">Previous</a></li>");
        if(curPage == 1){
            ul.append("<li><span>1</span></li>");
        }else{
            ul.append("<li " + (curPage == 1? "class=\"selected\"" : "") + "><a href=\"1\">1</a></li>");
        }
        if(curPage - 2 != 1 && curPage - 2 > 1){
            ul.append("<li><span>...</span></li>");
        }
        if(curPage - 1 != 1 && curPage - 1 > 1){
            ul.append("<li><a href=\"" + (curPage - 1) + "\">" + (curPage - 1) + "</a></li>");
        }
        if(curPage != 1 && curPage != pages) {
            ul.append("<li><span>" + curPage + "</span></li>");
        }
        if(curPage + 1 != pages && curPage + 1 < pages){
            ul.append("<li><a href=\"" + (curPage + 1) + "\">" + (curPage + 1) + "</a></li>");
        }
        if(curPage + 2 != pages && curPage + 2 < pages){
            ul.append("<li><span>...</span></li>");
        }
        if(curPage == pages){
            ul.append("<li><span>" + pages + "</span></li>");
        }else{
            ul.append("<li " + (curPage == pages? "class=\"selected\"" : "") + "><a href=\"" + pages + "\">" + pages + "</a></li>");
        }
        ul.append("<li><a href=\"next\">Next</a></li>");
        $("a", ul).click(function(e){
            e.preventDefault();
            var page = $(this).attr('href');
            if (page == 'previous' && curPage - 1 > 0){
                page = curPage - 1;
            }else if(page == 'previous' && curPage - 1 <= 0){ page = 1;
            }else if(page == 'next' && curPage + 1 <= pages){
                page = curPage + 1;
            }else if(page == 'next' && curPage + 1 > pages){
                page = pages;
            }
            _showPage(table, objs, pageLength, curPage, page);
        });
        return ul;
    };

    var _toggleInfoWindow = function(){
        if(typeof App.infoWindow !== "undefined" && App.infoWindow.state == "shown"){
            App.infoWindow.state = "hidden";
            App.infoWindow.close();
            App.infoWindow = {};
        }
        var m = this;
        var b = m.title;
        var Agave = window.Agave;
        var params = {'queryParams': {'building':b}};
        $.extend(params, App.config.baseNS);
        Agave.api.adama.search(
            params, 
            function(result){
                var data = JSON.parse(result.data);
                var o = data.result[0];
                var content = "<div class=\"haiti-info-window\">" +
                              "<h3>" + b + "</h3>" + 
                              "<div>" + 
                                  "<ul class=\"app-list\">" + 
                                      "<li><b>Priority Index:</b></li>" + 
                                      "<li>" + o["Priority Index  [%]"] + "</li>" +
                                      "<li><b>Col Index:</b></li>" + 
                                      "<li>" + o["Column Index  [%]"] + "</li>" +
                                      "<li><b>Wall Index:</b></li>" + 
                                      "<li>" + o["Wall Index  [%]"] + "</li>" +
                                      "<li><b>Reinforced Concrete Damage:</b></li>" + 
                                      "<li>" + o["Reinforced  Concrete Damage"] + "</li>" +
                                      "<li><b>Masonry Wall Damage:</b></li>" + 
                                      "<li>" + o["Masonry Wall  Damage"] + "</li>" + 
                                      "<li><b>Images</b></li>";
                var pics = o["Pictures"].split(",");
                var path;
                for(var i = 0; i <  pics.length; i++){
                    path = pics[i].split("/");
                    content += "<li><a target=\"_blank\" href=\"" + pics[i] + "\">" + path[path.length - 1] + "</a></li>";
                }
                content +=            "<li class=\"hshow\"><a onClick=\"HPI.showInTable(event);\" href=\"" + b + "\">Show in Table</a>" + "</li>" +
                                  "</ul>" + 
                              "</div>" +
                              "</div>";
                App.infoWindow = new google.maps.InfoWindow({
                    content: content
                });
                App.infoWindow.state = "shown";

                App.infoWindow.open(App.map, m);
            },
            function(err){
                console.log(err);
            });
    };

    var _createMarker = function(obj, map){
        var p = new google.maps.LatLng(obj["Latitude"], obj["Longitude"]);
        var o = {
            position: p,
            map: map,
            title: obj["Building"],
            team: obj["Team"],
            mwd: obj["Masonry Wall  Damage"],
            nf: obj["Number of  Floors"],
            pd: obj["Permenant  Drift"],
            rcd: obj["Reinforced  Concrete Damage"]
        };
        var m = new google.maps.Marker(o);
        google.maps.event.addListener(m, 'click', _toggleInfoWindow);
        App.markers[obj["Building"]] = m;
    }

    var _printJobsListing = function( result ){
        var data = JSON.parse(result.data);
        var objs = data.result;
        var table = App.config.appContext.find(".haiti-listing table");
        var meta = App.config.appContext.find(".haiti-listing-metadata");
        var tbody = table.find("tbody");
        var page = isNaN(table.attr("data-page")) ? 1 : table.attr("data-page");
        var o, row, divmd;

        App.center = {lat: objs[0]["Latitude"], lng: objs[0]["Longitude"]};
        printMap(objs);

        for(var i = 0; i < objs.length; i++){
            o = objs[i];
            row = _createRow(o, i);
            row.hide();
            tbody.append(row);
            divmd = _createMetadata(o);
            meta.append(divmd);
            _createMarker(o, App.map);
        }
        _showPage(table, objs, 10, 1, 1);
    };

    var _printGraphs = function( result ){
        var data = JSON.parse(result.data);
        var objs = data.result;
        var o, nf, cwa, mwa, tfa, x, pi;
        var nfo = {};
        var mwa_tfa = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var cwa_tfa = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var pind = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for(var i = 0; i < objs.length; i++){
            o = objs[i];
            nf = o["Number of  Floors"];
            cwa = o["Concrete Wall  Area E-W [ft\u00b2]"] + o["Concrete Wall  Area N-S [ft\u00b2]"];
            mwa = o["Masonry Wall  Area E-W [ft\u00b2]"] + o["Masonry Wall  Area N-S [ft\u00b2]"];
            tfa = o["Total Floor Area  [ft\u00b2]"];
            pi = o["Priority Index  [%]"];
            if(typeof nfo[nf] == "undefined"){
                nfo[nf] = {};
                nfo[nf].count = 1;
            }else{
                nfo[nf].count += 1;
            }
            /*
            x = mwa/tfa;
            switch(true){
                case (x == 0):
                    mwa_tfa[0] += 1;
                    break;
                case (x < 0.1):
                    mwa_tfa[1] += 1;
                    break;
                case (x < 0.2):
                    mwa_tfa[2] += 1;
                    break;
                case (x < 0.3):
                    mwa_tfa[3] += 1;
                    break;
                case (x < 0.4):
                    mwa_tfa[4] += 1;
                    break;
                case (x < 0.5):
                    mwa_tfa[5] += 1;
                    break;
                case (x < 0.6):
                    mwa_tfa[6] += 1;
                    break;
                case (x < 0.7):
                    mwa_tfa[7] += 1;
                    break;
                case (x < 0.8):
                    mwa_tfa[8] += 1;
                    break;
                case (x < 0.9):
                    mwa_tfa[9] += 1;
                    break;
                case (x < 1):
                    mwa_tfa[10] += 1;
                    break;
                default:
                    console.log("mwa default: " + i + " ", x);
                    break;
            }
            
            x = cwa/tfa;
            switch(true){
                case (x == 0):
                    cwa_tfa[0] += 1;
                    break;
                case (x < 0.1):
                    cwa_tfa[1] += 1;
                    break;
                case (x < 0.2):
                    cwa_tfa[2] += 1;
                    break;
                case (x < 0.3):
                    cwa_tfa[3] += 1;
                    break;
                case (x < 0.4):
                    cwa_tfa[4] += 1;
                    break;
                case (x < 0.5):
                    cwa_tfa[5] += 1;
                    break;
                case (x < 0.6):
                    cwa_tfa[6] += 1;
                    break;
                case (x < 0.7):
                    cwa_tfa[7] += 1;
                    break;
                case (x < 0.8):
                    cwa_tfa[8] += 1;
                    break;
                case (x < 0.9):
                    cwa_tfa[9] += 1;
                    break;
                case (x < 1):
                    cwa_tfa[10] += 1;
                    break;
                default:
                    console.log("cwa default: ", x);
                    break;
            }*/

            x = pi;
            switch(true){
                case (x == 0):
                    pind[0] += 1;
                    break;
                case (x < 0.1):
                    pind[1] += 1;
                    break;
                case (x < 0.2):
                    pind[2] += 1;
                    break;
                case (x < 0.3):
                    pind[3] += 1;
                    break;
                case (x < 0.4):
                    pind[4] += 1;
                    break;
                case (x < 0.5):
                    pind[5] += 1;
                    break;
                case (x < 0.6):
                    pind[6] += 1;
                    break;
                case (x < 0.7):
                    pind[7] += 1;
                    break;
                case (x < 0.8):
                    pind[8] += 1;
                    break;
                case (x < 0.9):
                    pind[9] += 1;
                    break;
                case (x < 1):
                    pind[10] += 1;
                    break;
            }
        }
        var bar = [];
        var garr = [];
        //garr.push(["No. Floors", "Distribution", { role: "style" }, { role: "annotation" }]);
        garr.push(["Concrete Wall Area / Total Floor Area", "Distribution", { role: "style"}, {role: "annotation"}]);
        for(var n in nfo){
            bar.push(n);
            bar.push(((+nfo[n].count / objs.length)));
            bar.push("#03A9F4");
            bar.push(nfo[n].count);
            garr.push(bar);
            bar = [];
        }
        var data = google.visualization.arrayToDataTable(garr);
        var chart = new google.visualization.ColumnChart(document.querySelector(".haiti-charts-floor"));
        chart.draw(data, {"title": "",
                          vAxis: {format: "#%", title: "% of Buildings."},
                          hAxis: {title: "No. of Floors."},
                          legend: "none"
                          });
        /*
        bar = [];
        garr = []
        garr.push(["Masonry Wall Area / Total Floor Area", "Distribution", { role: "style"}, {role: "annotation"}]);
        for(var i = 0; i < mwa_tfa.length; i++)
        {
            if(i == 0){bar.push("0");}
            else{bar.push("< 0." + i);}
            bar.push((mwa_tfa[i] / objs.length) * 100);
            bar.push("#03A9F4");
            bar.push(mwa_tfa[i]);
            garr.push(bar);
            bar = [];
        } 
        data = google.visualization.arrayToDataTable(garr);
        chart = new google.visualization.ColumnChart(document.querySelector(".haiti-charts-mwa"));
        chart.draw(data, {"title": "Masonry Wall Area / Total Floor Area"});
        bar = [];
        garr = [];
        garr.push(["Concrete Wall Area / Total Floor Area", "Distribution", { role: "style"}, {role: "annotation"}]);
        for(var i = 0; i < cwa_tfa.length; i++){
            if(i == 0){bar.push("0");}
            else{bar.push("< 0." + i);}
            bar.push((cwa_tfa[i] / objs.length) * 100);
            bar.push("#03A9F4");
            bar.push(cwa_tfa[i]);
            garr.push(bar);  
            bar = [];
        }
        data = google.visualization.arrayToDataTable(garr);
        chart = new google.visualization.ColumnChart(document.querySelector(".haiti-charts-cwa"));
        chart.draw(data, {"title": "Concrete Wall Area / Total Floor Area"});
        */
        bar = [];
        garr = [];
        garr.push(["Priority Index", "Distribution", { role: "style"}, {role: "annotation"}]);
        for(var i = 0; i < cwa_tfa.length; i++){
            if(i == 0){bar.push("0");}
            else{bar.push("< 0." + i);}
            bar.push((pind[i] / objs.length));
            bar.push("#03A9F4");
            bar.push(pind[i]);
            garr.push(bar);  
            bar = [];
        }
        data = google.visualization.arrayToDataTable(garr);
        chart = new google.visualization.ColumnChart(document.querySelector(".haiti-charts-pind"));
        chart.draw(data, {"title": "",
                          vAxis: {format: "#%", title: "% of Buildings."},
                          hAxis: {title: "Priority Index."},
                          legend: "none"
        });

    };

    var _showInTable = function(e){
        e.preventDefault();
        var a = $(".haiti-info-window .hshow > a");
        var name = a.attr("href");
        var tr = App.config.appContext.find(".haiti-listing table tbody tr[data-building=\"" + name + "\"]");
        var index = tr.attr("data-index");
        var page = Math.ceil((+index + 1) / 10);
        _showPage(App.config.appContext.find(".haiti-listing > table"), App.config.appContext.find(".haiti-listing > table > tbody > tr"), 10, page, page);
        App.config.appContext.find(".haiti-listing table table tr").show();
        $('html, body').animate({
            scrollTop: tr.offset().top - tr.height()
        });
        tr.find("td").css('background', '#dff0d8');
        setTimeout(function(){ tr.find("td").css('background', 'white'); }, 5000)
        }

    var listBuildings = function(){
        var Agave = window.Agave;
        var params = {};
        $.extend(params, this.config.baseNS);
        Agave.api.adama.list(
            params,
            _printJobsListing,
            function(err){
                console.log(err);
            }
        );
    };

    var showGraphs = function(){
        var Agave = window.Agave;
        var params = {};
        $.extend(params, this.config.baseNS);
        Agave.api.adama.list(
            params,
            _printGraphs,
            function(err){
                console.log(err);
            }
        );
    };

    var identifyMarkersBy = function(event){
        var p = event.target.value;
        var color, m;
        var t = {};
        for(var mn in App.markers){
            m = App.markers[mn];
            if(p != "none"){
                color = ('00000' + (Math.random()*(1<<24)|0).toString(16)).slice(-6);
                if(typeof t[m[p]] == "undefined"){
                    t[m[p]] = color;
                }else{
                    color = t[m[p]];
                }
                m.setIcon("http://www.googlemapsmarkers.com/v1/" + m[p].substring(0, 1) + "/" + color + "/");
            } else {
                m.setIcon("http://www.googlemapsmarkers.com/v1/ff5555/");
            }
        }
    };

    var _gmapInit = function(){
        var options = {
            center: App.center,
            zoom:12
        }
        App.map = new google.maps.Map(document.querySelector(".haiti-gmap"), options);
        var dropDownDiv = document.createElement("div");
        dropDownDiv.setAttribute("style", "margin-top:5px; padding:5px; background:white; border:1px solid #ccc;");
        var select = document.createElement("select");
        select.setAttribute("id", "identifyby");
        select.setAttribute("name", "identifyby");
        var option = document.createElement("option");
        option.setAttribute("value", "none");
        option.textContent = "Select One";
        select.appendChild(option);

        option = document.createElement("option");
        option.setAttribute("value", "team");
        option.textContent = "Team";
        select.appendChild(option);

        option = document.createElement("option");
        option.setAttribute("value", "mwd");
        option.textContent = "Masonry Wall Damage";
        select.appendChild(option);
        option = document.createElement("option");
        option.setAttribute("value", "nf");
        option.textContent = "Number of Floors";
        select.appendChild(option);
        option = document.createElement("option");
        option.setAttribute("value", "pd");
        option.textContent = "Permanent Drift";
        select.appendChild(option);
        option = document.createElement("option");
        option.setAttribute("value", "rcd");
        option.textContent = "Reinforced Concrete Damage";
        select.appendChild(option);
        select.setAttribute("onchange", "HPI.identifyMarkersBy(event);");
        var label = document.createElement("label");
        label.setAttribute("for", "identifyby");
        label.textContent = "Identify By: ";
        dropDownDiv.appendChild(label);
        dropDownDiv.appendChild(select);
        App.map.controls[google.maps.ControlPosition.TOP_CENTER].push(dropDownDiv);
    };

    var printMap = function(objs){
        _gmapInit();
    };

    App.listBuildings = listBuildings;
    App.gmapInit = _gmapInit;
    App.showInTable = _showInTable;
    App.identifyMarkersBy = identifyMarkersBy;
    App.showGraphs = showGraphs;
    return App;
})(window, jQuery);
(function(window, $){
    'use strict';
    window.addEventListener("Agave::ready", function() {
        HPI.listBuildings();
        HPI.showGraphs();
    });
})(window, jQuery);
