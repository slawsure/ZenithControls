var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Zenith;
(function (Zenith) {
    var ListBox = (function (_super) {
        __extends(ListBox, _super);
        function ListBox(baseDivElementId) {
                _super.call(this, baseDivElementId);
            this.NumColumns = 1;
            this.ColumnSpace = 10;
            this.ItemList = new Zenith.List();
        }
        ListBox.prototype.AddItem = function (value, text) {
            this.ItemList.Add(new Zenith.ListItem(value, text));
        };
        ListBox.prototype.AddArrayData = function (data) {
            for(var index = 0; index < data.length; index++) {
                this.AddItem(data[index][0], data[index][1]);
            }
        };
        ListBox.prototype.AddJSONData = function (data, valueDataField, textDataField) {
            if(!valueDataField || valueDataField.length <= 0) {
                valueDataField = 'Value';
            }
            if(!textDataField || textDataField.length <= 0) {
                textDataField = 'Text';
            }
            for(var index = 0; index < data.length; index++) {
                this.AddItem(data[index][valueDataField], data[index][textDataField]);
            }
        };
        ListBox.prototype.Build = function () {
            var _this = this;
            if(this.ItemList.Count() <= 0) {
                throw new Error("The item list is empty.");
            }
            this.Clear();
            var table = document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithListBoxTable';
            var tbody = document.createElement('tbody');
            table.appendChild(tbody);
            var trow;
            var tcell;

            var colIndex = 0;
            for(var index = 0; index < this.ItemList.Count(); index++) {
                if(!trow || colIndex >= this.NumColumns) {
                    trow = document.createElement('tr');
                    tbody.appendChild(trow);
                    colIndex = 0;
                }
                tcell = document.createElement('td');
                trow.appendChild(tcell);
                if(colIndex > 0) {
                    tcell.style.paddingLeft = this.ColumnSpace + "px";
                }
                this.addEventListener(tcell, 'click', function (event) {
                    _this.selectedEventHandler(event);
                });
                var label = document.createElement('label');
                label.id = 'listItem_' + this.ItemList.ElementAt(index).Value;
                label.setAttribute('value', this.ItemList.ElementAt(index).Value);
                label.textContent = this.ItemList.ElementAt(index).Text;
                label.innerHTML = this.ItemList.ElementAt(index).Text;
                label.className = 'ZenithListBoxLabel_Unselected';
                tcell.appendChild(label);
                colIndex++;
            }
            if(this.IsPopup()) {
                _super.prototype.SetPopup.call(this);
            }
            this.ParentElement = table;
            _super.prototype.Build.call(this);
        };
        ListBox.prototype.SetSelected = function (selectedValue) {
            var selectedText = '';
            var items = this.BaseElement.getElementsByTagName('label');
            for(var index = 0; index < items.length; index++) {
                if(items[index] instanceof HTMLLabelElement) {
                    var label = items[index];
                    if(label.getAttribute('value') == selectedValue) {
                        label.setAttribute('selected', 'true');
                        label.className = 'ZenithListBoxLabel_Selected';
                        selectedText = label.textContent;
                    } else {
                        label.removeAttribute('selected');
                        label.className = 'ZenithListBoxLabel_Unselected';
                    }
                }
            }
            return selectedText;
        };
        ListBox.prototype.selectedEventHandler = function (event) {
            var targetElement = event.srcElement;
            if(!targetElement) {
                targetElement = event.target;
            }
            if(targetElement) {
                var label = null;
                if(targetElement instanceof HTMLLabelElement) {
                    label = targetElement;
                } else {
                    if(targetElement.childElementCount > 0) {
                        label = targetElement.childNodes[0];
                    }
                }
                if(label) {
                    var value = label.getAttribute('value');
                    if(value) {
                        var selectedText = this.SetSelected(value);
                        this.SetOutput(value);
                        _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [
                            value, 
                            selectedText
                        ]);
                    }
                }
            }
        };
        return ListBox;
    })(Zenith.ControlBase);
    Zenith.ListBox = ListBox;    
})(Zenith || (Zenith = {}));

