var getScriptPromisify = (src) => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}

(function () {

    //Chart Block in HTML
    const prepared = document.createElement('template')
    prepared.innerHTML = `
        <div id="root" style="width: 100%; height: 100%;">
        </div>
      `
    //Main JS Class holds methods to be called
    class SamplePrepared extends HTMLElement {
        constructor() {

            //call SAC DOM Super method to get shadow DOM information
            super()

            //Get shadow DOM informations
            this._shadowRoot = this.attachShadow({ mode: 'open' })
            this._shadowRoot.appendChild(prepared.content.cloneNode(true))

            //Set HTML block in shadow DOM of SAC
            this._root = this._shadowRoot.getElementById('root')

            //_props object is used to hold properties infosrmation
            this._props = {}

        }
        //render() method to plot chart - resultSet1 holds data from SAC table/chart.
        async render(resultSet, key) {

            console.log(resultSet);
            console.log(key);

            await getScriptPromisify('https://cdn.amcharts.com/lib/4/core.js');
            await getScriptPromisify('https://cdn.amcharts.com/lib/4/themes/animated.js');
            await getScriptPromisify('https://cdn.amcharts.com/lib/4/charts.js');

            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create(this._root, am4charts.XYChart);
            var dataobject = [];
            var daterecord = [];
            for (let i = 0; i < resultSet.length; i++) {

                if (daterecord.indexOf(resultSet[i].Ship_Date.id) === -1) {

                    daterecord.push(resultSet[i].Ship_Date.id);

                    if (resultSet[i].Segment.id === "Corporate") {

                        dataobject.push({
                            "Date": resultSet[i].Ship_Date.id,
                            "Corporate": Number(resultSet[i]["@MeasureDimension"].formattedValue)
                        });

                    } else if (resultSet[i].Segment.id === "Consumer") {

                        dataobject.push({
                            "Date": resultSet[i].Ship_Date.id,
                            "Consumer": Number(resultSet[i]["@MeasureDimension"].formattedValue)
                        });

                    } else {

                        dataobject.push({
                            "Date": resultSet[i].Ship_Date.id,
                            "HomeOffice": Number(resultSet[i]["@MeasureDimension"].formattedValue)
                        });

                    }

                } else {

                    if (resultSet[i].Segment.id === "Corporate") {

                        dataobject[daterecord.indexOf(resultSet[i].Ship_Date.id)]["Corporate"] = Number(resultSet[i]["@MeasureDimension"].formattedValue);

                    } else if (resultSet[i].Segment.id === "Consumer") {

                        dataobject[daterecord.indexOf(resultSet[i].Ship_Date.id)]["Consumer"] = Number(resultSet[i]["@MeasureDimension"].formattedValue);

                    } else {

                        dataobject[daterecord.indexOf(resultSet[i].Ship_Date.id)]["HomeOffice"] = Number(resultSet[i]["@MeasureDimension"].formattedValue);

                    }
                }

            }

            console.log(dataobject);
            chart.data = dataobject;

            // Create axes
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.minGridDistance = 50;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            // Create series
            function createAxisAndSeries(field, name) {

                var series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.valueY = field;
                series.dataFields.dateX = "Date";
                series.strokeWidth = 2;
                series.yAxis = valueAxis;
                series.name = name;
                series.tooltipText = "{Date}[/]{name}: [bold]{valueY}[/]";
                series.tensionX = 0.8;
                series.showOnInit = true;

                var interfaceColors = new am4core.InterfaceColorSet();

                var bullet = series.bullets.push(new am4charts.CircleBullet());
                bullet.circle.stroke = interfaceColors.getFor("background");
                bullet.circle.strokeWidth = 2;

            }

            createAxisAndSeries("Corporate", "Corporate");
            createAxisAndSeries("Consumer", "Consumer");
            createAxisAndSeries("HomeOffice", "HomeOffice");

            // Add legend
            chart.legend = new am4charts.Legend();

            // Add cursor
            chart.cursor = new am4charts.XYCursor();

        }
    }
    customElements.define('com-sap-sample-linearea-mj', SamplePrepared)
})()