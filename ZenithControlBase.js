var Zenith;
(function (Zenith) {
    var ControlBase = (function () {
        function ControlBase(baseDivElementId) {
            this.MaximumHeight = 0;
            this.PopUpControlId = '';
            this.PopUpPosition = 'right';
            this.PopUpDirection = 'down';
            this.popupOffset = 3;
            this.events = new Array();
            if(baseDivElementId.length <= 0) {
                throw Error("The id of a 'div' HTML element must be passed to the Zenith control when creating.");
            }
            this.BaseElement = document.getElementById(baseDivElementId);
            if(!this.BaseElement) {
                throw Error("The id of the 'div' HTML element passed in is not valid.");
            }
            if(!(this.BaseElement instanceof HTMLDivElement)) {
                throw Error("The element associated with the Zenith control must be a div element.");
            }
            this.BaseElement.style.borderColor = '#B6B8BA';
            this.BaseElement.style.borderWidth = '1px';
            this.BaseElement.style.borderStyle = 'solid';
        }
        ControlBase.prototype.Close = function () {
            this.ExecuteEvent(ZenithEvent.EventType.Close);
            if(this.BaseElement) {
                this.BaseElement.style.visibility = 'collapse';
            }
        };
        ControlBase.prototype.addZenithEventListener = function (eventType, listener) {
            this.events.push(new ZenithEvent(eventType, listener));
        };
        ControlBase.prototype.removeZenithEventListener = function (eventType, listener) {
            for(var index = 0; index < this.events.length; index++) {
                if(this.events[index].eventType == eventType) {
                    this.events.splice(index, 1);
                }
            }
        };
        ControlBase.prototype.Build = function () {
            var popupElement = document.getElementById(this.PopUpControlId);
            this.BaseElement.style.overflowY = 'auto';
            this.BaseElement.style.overflowX = 'hidden';
            var baseWidth = this.ParentElement.clientWidth;
            if(this.MaximumHeight > 0 && this.MaximumHeight < this.ParentElement.clientHeight) {
                baseWidth += this.getScrollerWidth();
            }
            this.BaseElement.style.width = baseWidth.toString() + 'px';
            if(this.MaximumHeight > 0) {
                this.BaseElement.style.maxHeight = this.MaximumHeight + 'px';
            }
            if(this.popupElement) {
                this.BaseElement.style.visibility = 'collapse';
            }
        };
        ControlBase.prototype.SetPopup = function () {
            var _this = this;
            this.popupElement = document.getElementById(this.PopUpControlId);
            if(this.popupElement) {
                this.addEventListener(document, 'keydown', function (event) {
                    var keyEvent = event;
                    if((event && keyEvent.keyCode) && keyEvent.keyCode == 27 || (window.event && window.event.keyCode && window.event.keyCode == 27)) {
                        if(_this.BaseElement.style.visibility == 'visible') {
                            _this.Close();
                        }
                    }
                });
                this.addEventListener(document, 'click', function (event) {
                    var mouseEvent = event;
                    var targetElement = mouseEvent.srcElement;
                    if(!targetElement) {
                        targetElement = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);
                    }
                    if(targetElement) {
                        if(_this.BaseElement.style.visibility == 'visible') {
                            while(targetElement && targetElement != _this.BaseElement && targetElement != document.documentElement) {
                                targetElement = targetElement.parentElement;
                            }
                            if(targetElement && targetElement == document.documentElement) {
                                _this.Close();
                            }
                        } else {
                            if(_this.popupElement == targetElement) {
                                _this.OnPopupElement();
                            }
                        }
                    }
                });
                this.addEventListener(this.BaseElement, 'mouseout', function (event) {
                    var mouseEvent = event;
                    var targetElement = mouseEvent.toElement;
                    if(!targetElement) {
                        targetElement = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);
                    }
                    if(targetElement) {
                        while(targetElement && targetElement != _this.BaseElement) {
                            targetElement = targetElement.parentElement;
                        }
                        if(targetElement != _this.BaseElement) {
                            _this.Close();
                        }
                    }
                });
                this.BaseElement.style.position = 'absolute';
                this.BaseElement.style.zIndex = '10000';
                var positions = this.findAbsolutePosition(this.popupElement);
                var popupAbsLeft = positions[0];
                var popupAbsTop = positions[1];
                var position = this.PopUpPosition.toUpperCase();
                var direction = this.PopUpDirection.toUpperCase();
                var top;
                if(position == 'ABOVE') {
                    if(direction == 'UP') {
                        top = popupAbsTop - this.popupOffset - this.BaseElement.offsetHeight;
                    } else {
                        top = popupAbsTop - this.popupOffset , screen.availHeight;
                    }
                } else {
                    if(position == 'BELOW') {
                        if(direction == 'UP') {
                            top = popupAbsTop + this.popupOffset + this.popupElement.offsetHeight - this.BaseElement.offsetHeight;
                        } else {
                            top = popupAbsTop + this.popupOffset + this.popupElement.offsetHeight;
                        }
                    } else {
                        if(direction == 'UP') {
                            top = popupAbsTop + this.popupElement.offsetHeight - this.BaseElement.offsetHeight;
                        } else {
                            top = popupAbsTop;
                        }
                    }
                }
                if(top + this.BaseElement.offsetHeight > screen.availHeight) {
                    top = screen.availHeight - this.BaseElement.offsetHeight;
                }
                if(top < 0) {
                    top = 0;
                }
                this.BaseElement.style.top = top + 'px';
                var left;
                if(position == 'ABOVE' || position == 'BELOW') {
                    left = popupAbsLeft + (this.popupElement.offsetWidth / 2) - (this.BaseElement.offsetWidth / 2) , 0;
                } else {
                    if(position == 'LEFT') {
                        left = popupAbsLeft - this.popupOffset - this.BaseElement.offsetWidth;
                    } else {
                        left = popupAbsLeft + this.popupElement.offsetWidth + this.popupOffset;
                    }
                }
                if(left + this.BaseElement.offsetWidth > screen.availWidth) {
                    left = screen.availWidth - this.BaseElement.offsetWidth;
                }
                if(left < 0) {
                    left = 0;
                }
                this.BaseElement.style.left = left + 'px';
            } else {
                throw new Error('Popup control with id ' + this.PopUpControlId + ' could not be found.');
            }
        };
        ControlBase.prototype.IsPopup = function () {
            return this.PopUpControlId.trim().length > 0;
        };
        ControlBase.prototype.SetOutput = function (value, elementId) {
            var outputElement = elementId && elementId.length > 0 ? document.getElementById(elementId) : this.OutputElementId && this.OutputElementId.length > 0 ? document.getElementById(this.OutputElementId) : null;
            if(outputElement) {
                if(outputElement instanceof HTMLInputElement) {
                    (outputElement).value = value ? value.toString() : '';
                } else {
                    outputElement.textContent = value ? value.toString() : '';
                }
            }
        };
        ControlBase.prototype.Clear = function () {
            while(this.BaseElement.firstChild) {
                this.RemoveElement(this.BaseElement.firstChild);
            }
        };
        ControlBase.prototype.RemoveElement = function (element) {
            while(element.firstChild) {
                this.RemoveElement(element.firstChild);
            }
            if(element.parentElement) {
                element.parentElement.removeChild(element);
            } else {
                if(element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }
        };
        ControlBase.prototype.ExecuteEvent = function (eventType, eventParms) {
            for(var index = 0; index < this.events.length; index++) {
                if(this.events[index].eventType == eventType) {
                    if(this.events[index].listener) {
                        this.events[index].listener.apply(this, eventParms);
                    }
                }
            }
        };
        ControlBase.prototype.addEventListener = function (element, event, listener) {
            if(element.addEventListener) {
                element.addEventListener(event, listener);
            } else {
                if(element.attachEvent) {
                    element.attachEvent(event, listener);
                }
            }
        };
        ControlBase.prototype.findAbsolutePosition = function (obj) {
            var curleft = 0;
            var curtop = 0;
            if(obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                }while(obj = obj.offsetParent)
            }
            return [
                curleft, 
                curtop
            ];
        };
        ControlBase.prototype.OnPopupElement = function () {
            if(this.BaseElement.style.visibility == 'visible') {
                this.Close();
            } else {
                this.BaseElement.style.visibility = 'visible';
                this.ParentElement.focus();
            }
        };
        ControlBase.prototype.getScrollerWidth = function () {
            var scr = document.createElement('div');
            scr.style.position = 'absolute';
            scr.style.top = '-1000px';
            scr.style.left = '-1000px';
            scr.style.width = '100px';
            scr.style.height = '50px';
            scr.style.overflow = 'hidden';
            var inn = document.createElement('div');
            inn.style.width = '100%';
            inn.style.height = '200px';
            scr.appendChild(inn);
            document.body.appendChild(scr);
            var wNoScroll = inn.offsetWidth;
            scr.style.overflow = 'auto';
            var wScroll = inn.offsetWidth;
            document.body.removeChild(document.body.lastChild);
            return (wNoScroll - wScroll);
        };
        return ControlBase;
    })();
    Zenith.ControlBase = ControlBase;    
    var ListItem = (function () {
        function ListItem(value, text) {
            this.Value = value;
            this.Text = text;
        }
        return ListItem;
    })();
    Zenith.ListItem = ListItem;    
    var ZenithEvent = (function () {
        function ZenithEvent(eventType, listener) {
            this.eventType = eventType;
            this.listener = listener;
        }
        ZenithEvent.EventType = {
            Selected: 1,
            Close: 2
        };
        return ZenithEvent;
    })();
    Zenith.ZenithEvent = ZenithEvent;    
    function Zenith_SortObjectsByKey(objects, key, sortOrder) {
        objects.sort((function () {
            return function (a, b) {
                var objectIDA = a[key].toUpperCase();
                var objectIDB = b[key].toUpperCase();
                if(objectIDA === objectIDB) {
                    return 0;
                }
                if(sortOrder == 'asc') {
                    return objectIDA > objectIDB ? 1 : -1;
                } else {
                    return objectIDA < objectIDB ? 1 : -1;
                }
            }
        })());
    }
    Zenith.Zenith_SortObjectsByKey = Zenith_SortObjectsByKey;
})(Zenith || (Zenith = {}));

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
