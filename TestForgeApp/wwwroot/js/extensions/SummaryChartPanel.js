class SummaryChartPanel extends Autodesk.Viewing.UI.PropertyPanel {
    constructor(viewer, id, title, options) {
        super(viewer.container, id, title, options);
        this._viewer = viewer;
        this._canvas = document.createElement('canvas');
        this._canvas.style.setProperty('width', '100%');
        this._canvas.style.setProperty('height', '100%');
        this._canvas.style.setProperty('padding', '1em');
        this.scrollContainer.appendChild(this._canvas);
        this._chart = new Chart(this._canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: false
                }
            }
        });
    }

    showData(occurrences) {
        let colors = [];
        for (let i = 0; i < occurrences.size; i++) {
            const r = Math.round(Math.random() * 255);
            const g = Math.round(Math.random() * 255);
            const b = Math.round(Math.random() * 255);
            colors.push(`rgba(${r},${g},${b},0.5)`);
        }
        this._chart.data.labels = Array.from(occurrences.keys());
        this._chart.data.datasets[0].data = Array.from(occurrences.values()).map(dbids => dbids.length);
        this._chart.data.datasets[0].backgroundColor = colors;
        this._chart.data.datasets[0].borderColor = colors;
        this._chart.options.onClick = (evt, item) => {
            const dbids = occurrences.get(item[0]._model.label);
            this._viewer.isolate(dbids);
            this._viewer.fitToView(dbids);
        };
        this._chart.update();
    }
}

class SummaryChartExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._group = null;
        this._button = null;
        this._panel = null;
    }

    load() {
        this._panel = new SummaryChartPanel(this.viewer, 'summary-chart-panel', 'Model Summary Chart');
        console.log('SummaryChartExtension loaded.');
        return true;
    }

    unload() {
        this._panel = null;
        console.log('SummaryChartExtension unloaded.');
        return true;
    }

    onToolbarCreated() {
        this._group = this.viewer.toolbar.getControl('my-extensions-toolbar');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('my-extensions-toolbar');
            this.viewer.toolbar.addControl(this._group);
        }

        this._button = new Autodesk.Viewing.UI.Button('summary-chart-btn');
        this._button.onClick = async () => {
            if (this._panel.isVisible()) {
                this._panel.setVisible(false);
            } else {
                const dbids = this.getLeafObjectIDs(this.viewer.model);
                const occurrences = await this.computeHistogram(this.viewer.model, dbids, 'Material');
                this._panel.showData(occurrences);
                this._panel.setVisible(true);
            }
        };
        this._button.setToolTip('Model Summary Chart');
        this._group.addControl(this._button);
    }

    /**
     * Computes histogram of various values appearing in a given property name.
     * @async
     * @param {Model} model Forge Viewer model instance.
     * @param {number[]} dbids IDs of objects to include in the computation.
     * @param {string} propertyName Name of the property to compute the histogram for.
     * @returns {Promise<Map>} Map with keys representing various property values,
     * and values being arrays of object IDs.
     */
    computeHistogram(model, dbids, propertyName) {
        return new Promise(function (resolve, reject) {
            function onSuccess(items) {
                let occurrences = new Map();
                for (const item of items) {
                    if (item.properties.length === 1) {
                        const { displayValue } = item.properties[0];
                        if (!occurrences.has(displayValue)) {
                            occurrences.set(displayValue, []);
                        }
                        occurrences.get(displayValue).push(item.dbId);
                    }
                }
                resolve(occurrences);
            }
            function onError(err) {
                reject(err);
            }
            model.getBulkProperties(dbids, { propFilter: [propertyName] }, onSuccess, onError);
        });
    }

    /**
     * Collects IDs of all "leaf" (smallest selectable) objects from given model.
     * @param {Model} model Forge Viewer model instance.
     * @returns {number[]} IDs of all leaf nodes.
     */
    getLeafObjectIDs(model) {
        const tree = model.getInstanceTree();
        let dbids = [];
        tree.enumNodeChildren(tree.getRootId(), dbid => {
            if (tree.getChildCount(dbid) === 0) {
                dbids.push(dbid);
            }
        }, true);
        return dbids;
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('SummaryChartExtension', SummaryChartExtension);