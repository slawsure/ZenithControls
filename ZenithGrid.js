var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Zenith;
(function (Zenith) {
    var Grid = (function (_super) {
        __extends(Grid, _super);
        function Grid(baseDivElementId, dataSource) {
                _super.call(this, baseDivElementId);
            this.DataKeyName = '';
            this.IsSelectable = true;
            this.IsSortable = true;
            this.GroupedByKeyName = '';
            this.GroupExpandImage = false;
            this.sortOrder = '';
            this.sortName = '';
            this.groupedFieldCellIndex = 0;
            this.DataSource = dataSource;
        }
        Grid.prototype.Build = function () {
            var _this = this;
            this.Clear();
            var isGrouped = this.GroupedByKeyName && this.GroupedByKeyName.length > 0;
            if(isGrouped) {
                Zenith.Zenith_SortObjectsByKey(this.DataSource, this.GroupedByKeyName, "asc");
            } else {
                if(this.IsSortable && this.sortName.length > 0) {
                    Zenith.Zenith_SortObjectsByKey(this.DataSource, this.sortName, this.sortOrder);
                }
            }
            var th;
            var td;
            var trow;

            var table = document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithGridTable';
            this.ParentElement = table;
            var thead = document.createElement('thead');
            table.appendChild(thead);
            var headerRow = document.createElement('tr');
            thead.appendChild(headerRow);
            if(this.GroupExpandImage) {
                th = document.createElement('th');
                headerRow.appendChild(th);
                th.style.width = '17px';
            }
            for(var key in this.BindFields) {
                var fieldName = this.BindFields[key].FieldName;
                if(fieldName) {
                    th = document.createElement('th');
                    headerRow.appendChild(th);
                    th.id = fieldName;
                    th.textContent = this.BindFields[key].Header;
                    if(fieldName == this.DataKeyName || (this.BindFields[key].Hidden && this.BindFields[key].Hidden == true)) {
                        th.style.display = 'none';
                    } else {
                        if(this.IsSortable && !isGrouped) {
                            th.addEventListener('click', function (event) {
                                _this.sortOrder = _this.sortOrder == 'asc' ? 'desc' : 'asc';
                                _this.sortName = (event.currentTarget).id;
                                _this.Build();
                            });
                        }
                        if(this.BindFields[key].Width) {
                            th.style.width = this.BindFields[key].Width + "px";
                        }
                    }
                }
            }
            var tbody = document.createElement('tbody');
            table.appendChild(tbody);
            var currenttbody;
            var groupRowIndex = 0;
            var inGroup = false;
            for(var index = 0; index < this.DataSource.length; index++) {
                if(isGrouped) {
                    if(index == 0 || this.DataSource[index - 1][this.GroupedByKeyName].toUpperCase() != this.DataSource[index][this.GroupedByKeyName].toUpperCase()) {
                        groupRowIndex++;
                        currenttbody = document.createElement('tbody');
                        table.appendChild(currenttbody);
                        if(index == this.DataSource.length - 1 || this.DataSource[index][this.GroupedByKeyName].toUpperCase() != this.DataSource[index + 1][this.GroupedByKeyName].toUpperCase()) {
                            inGroup = false;
                        } else {
                            inGroup = true;
                            var numColumns = 0;
                            var groupRow = document.createElement('tr');
                            groupRow.setAttribute('groupRow', 'true');
                            currenttbody.appendChild(groupRow);
                            groupRow.addEventListener('click', function (event) {
                                if(event.currentTarget instanceof HTMLTableRowElement) {
                                    var groupRow = event.currentTarget;
                                    var expand = true;
                                    if(groupRow.parentElement && groupRow.parentElement.nextSibling) {
                                        var nextBody = groupRow.parentElement.nextSibling;
                                        if(nextBody) {
                                            if(nextBody.style.display == 'none') {
                                                expand = true;
                                                nextBody.style.display = '';
                                            } else {
                                                expand = false;
                                                nextBody.style.display = 'none';
                                            }
                                            groupRow.setAttribute('expanded', expand ? 'true' : 'false');
                                            _this.SetRowClass();
                                        }
                                    }
                                    if(_this.GroupExpandImage) {
                                        var images = groupRow.cells[0].getElementsByTagName('img');
                                        if(expand) {
                                            (images[1]).style.display = 'inline';
                                            (images[0]).style.display = 'none';
                                        } else {
                                            (images[1]).style.display = 'none';
                                            (images[0]).style.display = 'inline';
                                        }
                                    }
                                }
                            });
                            groupRow.tabIndex = groupRowIndex;
                            if(this.GroupExpandImage) {
                                td = document.createElement('td');
                                groupRow.appendChild(td);
                                td.style.width = '17px';
                                var expandImage = document.createElement('img');
                                td.appendChild(expandImage);
                                expandImage.src = 'expand.png';
                                var collapseImage = document.createElement('img');
                                td.appendChild(collapseImage);
                                collapseImage.src = 'collapse.png';
                                collapseImage.style.display = 'none';
                            }
                            groupRow.style.cursor = 'pointer';
                            for(var key in this.BindFields) {
                                var fieldName = this.BindFields[key].FieldName;
                                if(fieldName) {
                                    td = document.createElement('td');
                                    groupRow.appendChild(td);
                                    if(fieldName == this.GroupedByKeyName) {
                                        td.textContent = this.DataSource[index][fieldName];
                                        if(this.BindFields[key].Width) {
                                            td.style.width = this.BindFields[key].Width + "px";
                                        }
                                    }
                                    if(fieldName == this.DataKeyName || (this.BindFields[key].Hidden && this.BindFields[key].Hidden == true)) {
                                        td.style.display = 'none';
                                    } else {
                                        numColumns++;
                                    }
                                }
                            }
                            currenttbody = document.createElement('tbody');
                            table.appendChild(currenttbody);
                            currenttbody.style.display = "none";
                        }
                    }
                } else {
                    if(currenttbody == null) {
                        currenttbody = document.createElement('tbody');
                        table.appendChild(currenttbody);
                    }
                }
                trow = document.createElement('tr');
                currenttbody.appendChild(trow);
                trow.tabIndex = groupRowIndex;
                if(inGroup) {
                    trow.setAttribute('inGroup', 'true');
                }
                if(this.GroupExpandImage) {
                    td = document.createElement('td');
                    trow.appendChild(td);
                    td.style.width = '17px';
                }
                for(var key in this.BindFields) {
                    var fieldName = this.BindFields[key].FieldName;
                    if(fieldName) {
                        td = document.createElement('td');
                        trow.appendChild(td);
                        td.id = fieldName;
                        td.innerHTML = this.DataSource[index][fieldName] ? this.DataSource[index][fieldName] : '';
                        if(fieldName == this.DataKeyName || this.BindFields[key].Hidden && this.BindFields[key].Hidden == true) {
                            td.style.display = 'none';
                        } else {
                            if(this.BindFields[key].Width) {
                                td.style.width = this.BindFields[key].Width + "px";
                            }
                        }
                    }
                }
                if(this.IsSelectable) {
                    trow.addEventListener('click', function (event) {
                        _this.selectedEventHandler(event);
                    });
                    if(this.DataKeyName.length > 0) {
                        trow.setAttribute('keyValue', this.DataSource[index][this.DataKeyName]);
                    }
                }
            }
            table.style.cursor = this.IsSelectable ? 'pointer' : "";
            this.SetRowClass();
            if(this.IsPopup()) {
                _super.prototype.SetPopup.call(this);
            }
            _super.prototype.Build.call(this);
        };
        Grid.prototype.SetRowClass = function (selectedRow) {
            var rows = this.ParentElement.getElementsByTagName('tr');
            for(var index = 0; index < rows.length; index++) {
                var row = rows[index];
                if(this.IsSelectable && selectedRow) {
                    row.setAttribute('selected', selectedRow == row ? 'true' : 'false');
                }
                if(this.IsSelectable && row.attributes['selected'] && row.attributes['selected'].value == 'true') {
                    row.className = 'ZenithGrid_SelectedRow';
                } else {
                    if((row.attributes['inGroup'] && row.attributes['inGroup'].value == 'true') || (row.attributes['groupRow'] && row.attributes['groupRow'].value == 'true' && row.attributes['expanded'] && row.attributes['expanded'].value == 'true')) {
                        row.className = 'ZenithGrid_GroupRow';
                    } else {
                        if(index % 2 == 0) {
                            row.className = 'ZenithGrid_AltRow';
                        } else {
                            row.className = 'ZenithGrid_UnselectedRow';
                        }
                    }
                }
            }
        };
        Grid.prototype.selectedEventHandler = function (event) {
            var trow = event.currentTarget;
            this.SetRowClass(trow);
            this.SetOutput(trow.getAttribute('keyValue'));
            if(this.IsSelectable) {
                _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [
                    event.currentTarget, 
                    trow.getAttribute('keyValue'), 
                    trow.rowIndex
                ]);
            }
            if(this.IsPopup()) {
                _super.prototype.Close.call(this);
            }
        };
        return Grid;
    })(Zenith.ControlBase);
    Zenith.Grid = Grid;    
})(Zenith || (Zenith = {}));

