(function () {
    "use strict";

    var list = new WinJS.Binding.List();
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) {
            return item.group.key;
        },
        function groupDataSelector(item) {
            return item.group;
        }
        );
    generateSampleData()

    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) {
            return item.group.key === group.key;
        });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }
    function getWeek(year, month, day) {
        //lets calc weeknumber the cruel and hard way :D
        //Find JulianDay 
        //month += 1; //use 1-12
        var a = Math.floor((14 - (month)) / 12);
        var y = year + 4800 - a;
        var m = (month) + (12 * a) - 3;
        var jd = day + Math.floor(((153 * m) + 2) / 5) +
        (365 * y) + Math.floor(y / 4) - Math.floor(y / 100) +
        Math.floor(y / 400) - 32045;      // (gregorian calendar)
        //var jd = (day+1)+Math.Round(((153*m)+2)/5)+(365+y) + 
        //                 Math.round(y/4)-32083;    // (julian calendar)

        //now calc weeknumber according to JD
        var d4 = (jd + 31741 - (jd % 7)) % 146097 % 36524 % 1461;
        var L = Math.floor(d4 / 1460);
        var d1 = ((d4 - L) % 365) + L;
        var NumberOfWeek = Math.floor(d1 / 7) + 1;
        return NumberOfWeek;
    }
    // Returns an array of sample data that can be added to the application's
    // data list. 
    function loadJQuery() {
        if (!navigator.onLine) {
            Windows.UI.Popups.MessageDialog("U heeft geen actieve internetconnectie. Verbind met een netwerk en probeer opnieuw.", "Er is een fout opgetreden").showAsync();
        }
    }

    function generateSampleData() {
        loadJQuery();
        var url = "http://zeus.ugent.be/hydra/api/1.0/resto/week/";
        var currentdate = new Date();
        var day = currentdate.getDate();
        var month = currentdate.getMonth() + 1;
        var year = currentdate.getFullYear();
        var weeknr = getWeek(year, month, day);
        if (currentdate.getDay() == 6 || currentdate.getDay() == 0) {
            weeknr++;
        }
        url += (weeknr + ".json");
        var data = WinJS.xhr({
            url: url
        }).then(function (response) {
            var alldates = new Array();
            var allmeat = new Array();
            var allmeatprices = new Array();
            var allsoup = new Array();
            var allsoupprices = new Array();
            var allvegetables = new Array();
            var result = JSON.parse(response.responseText);
            var dates = new Array();
            for (var i = 0; i < 5 ; i++) {
                var date = new Date();
                var dd = date.getDate();
                if (currentdate.getDay() == 6) {
                    dd += 2;
                } else if (currentdate.getDay() == 0) {
                    dd += 1;
                } else {
                    dd -= (date.getDay() - 1);
                }
                var mm = date.getMonth() + 1;
                var yyyy = date.getFullYear();
                dd += i;
                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }
                date = yyyy + '-' + mm + '-' + dd;
                dates[i] = date;
            }
            alldates = dates;
            for (var i = 0 ; i < 5 ; i++) {
                console.log(dates[i]);
                if (result[dates[i]].open) {
                    var meat = new Array();
                    var meatprices = new Array();
                    for (var j = 0 ; j < 4 ; j++) {
                        meat[j] = result[dates[i]].meat[j].name;
                        if (result[dates[i]].meat[j].recommended) {
                            meat[j] = "" + meat[j]; // TODO: RECOMMENDED MEAT IN COLOR
                        }
                        meatprices[j] = result[dates[i]].meat[j].price;
                    }
                    allmeat[i] = meat;
                    allmeatprices[i] = meatprices;

                    var vegetables = new Array();
                    for (var j = 0 ; j < 2 ; j++) {
                        vegetables[j] = result[dates[i]].vegetables[j];
                    }
                    allvegetables[i] = vegetables;

                    var soup = result[dates[i]].soup.name;
                    allsoup[i] = soup;
                    var soupprice = result[dates[i]].soup.price;
                    allsoupprices[i] = soupprice;
                }
            }

            var itemContent = new Array();
            var itemSubContent = new Array();
            var vleesarray = new Array();
            var groentenarray = new Array();
            var soeparray = new Array();
            var googleresultnr = 1;
            
            for (var i = 0 ; i < 5 ; i++) {
                itemContent[i] = new Array();
                itemSubContent[i] = new Array();
                if (result[dates[i]].open) {
                    itemContent[i][0] = "";
                    itemSubContent[i][0] = "";
                    for (var j = 0 ; j < 4 ; j++) {
                        var str = "<p>" + allmeat[i][j] + " (" + allmeatprices[i][j] + ")</p>";
                        var strsub = allmeat[i][j];
                        if (j != 3) {
                            strsub += ", ";
                        }
                        itemContent[i][0] += str;
                        itemSubContent[i][0] += strsub;
                    }
                    itemContent[i][1] = "";
                    itemSubContent[i][1] = "";
                    for (var j = 0 ; j < 2 ; j++) {
                        var str = "<p>" + allvegetables[i][j] + "</p>";
                        var strsub = allvegetables[i][j];
                        if (j != 1) {
                            strsub += ", ";
                        }
                        itemContent[i][1] += str;
                        itemSubContent[i][1] += strsub;
                    }
                    itemContent[i][2] = allsoup[i] + " (" + allsoupprices[i] + ")";
                    itemSubContent[i][2] = allsoup[i];
                } else {
                    itemSubContent[i][0] = "";
                    itemSubContent[i][1] = "";
                    itemSubContent[i][2] = "";
                }
            }
            var groupDescription = "";
            var groupDescriptionMaandag = "Maandag";
            var groupDescriptionDinsdag = "Dinsdag";
            var groupDescriptionWoensdag = "Woensdag";
            var groupDescriptionDonderdag = "Donderdag";
            var groupDescriptionVrijdag = "Vrijdag";

            // These three strings encode placeholder images. You will want to set the
            // backgroundImage property in your real data to be URLs to images.
            var vleesarray = new Array();
            vleesarray[0] = "../images/vlees0.jpg";
            vleesarray[1] = "../images/vlees1.jpg";
            vleesarray[2] = "../images/vlees2.jpg";
            vleesarray[3] = "../images/vlees3.jpg";
            vleesarray[4] = "../images/vlees4.jpg";

            var groentenarray = new Array();
            groentenarray[0] = "../images/groenten0.jpg";
            groentenarray[1] = "../images/groenten1.jpg";
            groentenarray[2] = "../images/groenten2.jpg";
            groentenarray[3] = "../images/groenten3.jpg";
            groentenarray[4] = "../images/groenten4.jpg";

            var soeparray = new Array();
            soeparray[0] = "../images/soep0.jpg";
            soeparray[1] = "../images/soep1.jpg";
            soeparray[2] = "../images/soep2.jpg";
            soeparray[3] = "../images/soep3.jpg";
            soeparray[4] = "../images/soep4.jpg";
            // Each of these sample groups must have a unique key to be displayed
            // separately
            var days = new Array();
            days[0] = "Maandag";
            days[1] = "Dinsdag";
            days[2] = "Woensdag";
            days[3] = "Donderdag";
            days[4] = "Vrijdag";
            var keys = new Array();
            keys[0] = "group1";
            keys[1] = "group2";
            keys[2] = "group3";
            keys[3] = "group4";
            keys[4] = "group5";
            var sampleGroups = new Array();
            for (var i = 1; i <= 5 ; i++) {
                if (!result[dates[i - 1]].open) {
                    days[i - 1] = days[i - 1] + " (GESLOTEN)";
                    sampleGroups[i - 1] = {
                        key: keys[i - 1], 
                        title: days[i - 1], 
                        subtitle: "GESLOTEN", 
                        backgroundImage: groentenarray[3], 
                        description: groupDescription
                    };

                } else {
                    sampleGroups[i - 1] = {
                        key: keys[i - 1], 
                        title: days[i - 1], 
                        subtitle: "", 
                        backgroundImage: vleesarray[2], 
                        description: groupDescription
                    };

                }
            }
            for (var i = 0; i < 5; i++) {
                if (!result[dates[i]].open) {
                    for (var j = 0; j < 3; j++) {
                        itemContent[i][j] = "(gesloten)";
                    }
                }
            }
            var sampleItems = [
            {
                group: sampleGroups[0], 
                title: "Vlees", 
                subtitle: "", 
                description: itemSubContent[0][0], 
                content: itemContent[0][0], 
                backgroundImage: vleesarray[0]
            },
{
                group: sampleGroups[0], 
                title: "Groenten", 
                subtitle: "", 
                description: itemSubContent[0][1], 
                content: itemContent[0][1], 
                backgroundImage: groentenarray[0]
            },
{
                group: sampleGroups[0], 
                title: "Soep", 
                subtitle: "", 
                description: itemSubContent[0][2], 
                content: itemContent[0][2], 
                backgroundImage: soeparray[0]
            },

{
                group: sampleGroups[1], 
                title: "Vlees", 
                subtitle: "", 
                description: itemSubContent[1][0], 
                content: itemContent[1][0], 
                backgroundImage: vleesarray[1]
            },
{
                group: sampleGroups[1], 
                title: "Groenten", 
                subtitle: "", 
                description: itemSubContent[1][1], 
                content: itemContent[1][1], 
                backgroundImage: groentenarray[1]
            },
{
                group: sampleGroups[1], 
                title: "Soep", 
                subtitle: "", 
                description: itemSubContent[1][2], 
                content: itemContent[1][2], 
                backgroundImage: soeparray[1]
            },

{
                group: sampleGroups[2], 
                title: "Vlees", 
                subtitle: "", 
                description: itemSubContent[2][0], 
                content: itemContent[2][0], 
                backgroundImage: vleesarray[2]
            },
{
                group: sampleGroups[2], 
                title: "Groenten", 
                subtitle: "", 
                description: itemSubContent[2][1], 
                content: itemContent[2][1], 
                backgroundImage: groentenarray[2]
            },
{
                group: sampleGroups[2], 
                title: "Soep", 
                subtitle: "", 
                description: itemSubContent[2][2], 
                content: itemContent[2][2], 
                backgroundImage: soeparray[2]
            },

{
                group: sampleGroups[3], 
                title: "Vlees", 
                subtitle: "", 
                description: itemSubContent[3][0], 
                content: itemContent[3][0], 
                backgroundImage: vleesarray[3]
            },
{
                group: sampleGroups[3], 
                title: "Groenten", 
                subtitle: "", 
                description: itemSubContent[3][1], 
                content: itemContent[3][1], 
                backgroundImage: groentenarray[3]
            },
{
                group: sampleGroups[3], 
                title: "Soep", 
                subtitle: "", 
                description: itemSubContent[3][2], 
                content: itemContent[3][2], 
                backgroundImage: soeparray[3]
            },

{
                group: sampleGroups[4], 
                title: "Vlees", 
                subtitle: "", 
                description: itemSubContent[4][0], 
                content: itemContent[4][0], 
                backgroundImage: vleesarray[4]
            },
{
                group: sampleGroups[4], 
                title: "Groenten", 
                subtitle: "", 
                description: itemSubContent[4][1], 
                content: itemContent[4][1], 
                backgroundImage: groentenarray[4]
            },
{
                group: sampleGroups[4], 
                title: "Soep", 
                subtitle: "", 
                description: itemSubContent[4][2], 
                content: itemContent[4][2], 
                backgroundImage: soeparray[4]
            },

            ];
            for (var i = 0 ; i < sampleItems.length ; i++) {
                list.push(sampleItems[i]);
            }
        });
    }
})();
