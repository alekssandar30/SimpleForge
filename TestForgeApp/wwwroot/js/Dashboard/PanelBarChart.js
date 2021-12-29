

class BarChart extends DashboardPanelChart {
    constructor(property) {
        super();
        this.propertyToUse = property;
    }

    load(parentDivId, viewer, modelData) {
        if (!super.load(parentDivId, this.constructor.name, viewer, modelData)) return;
        this.drawChart();
    }

    drawChart() {
        var _this = this; // need this for the onClick event
        console.log(_this);

        var div = document.getElementById(_this.divId);
        console.log(div);
        

        var canvas = document.getElementById(this.canvasId);

        if (!canvas.getContext) {
            alert('Error: Canvas context does not exist!');
            return;
        }

        var ctx = canvas.getContext('2d');
        if (this.chart !== undefined) this.chart.destroy();
        var colors = this.generateColors(this.modelData.getLabels(this.propertyToUse).length);

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.modelData.getLabels(this.propertyToUse),
                datasets: [{
                    data: this.modelData.getCountInstances(this.propertyToUse),
                    backgroundColor: colors.background,
                    borderColor: colors.borders,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                legend: {
                    display: false
                },
                'onClick': function (evt, item) {
                    _this.viewer.isolate(_this.modelData.getIds(_this.propertyToUse, item[0]._model.label));
                    _this.viewer.utilities.fitToView();
                }
            }
        });
    }
}