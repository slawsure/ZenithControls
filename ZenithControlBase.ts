/********************************************************************************************
 * Developed by Shawn Lawsure - shawnl@maine.rr.com - http://www.linkedin.com/in/shawnlawsure

	All Zenith controls inhert the ControlBase class below.  See the comments above each 
	public member for a description of the available settings and methods.

	The 'base element' is an HTML element whose id is passed in the constructor for all
	Zenith controls and, essentially, provides a location for the control on the page.  This
	element must be a DIV element.

	All Zenith controls use a table element in which to draw the UI.  This is referenced by
	the ParentElement attribute.

	All Zenith controls support the following functionality:

		* 
********************************************************************************************/

module Zenith
{
	export class ControlBase
	{
		// BaseElement is the 'div' HTML element whose id is passed in the constructor.
        public BaseElement: HTMLElement;
        
		// ParentElement is the top-level element of this control inside the BaseElement.
		public ParentElement: HTMLElement;

		// Set the MaximumHeight to limit the height of the control.  If the MaximumHeight is less than
		// the height of the control after being built then a vertical scrollbar will automatically
		// appear.
        public MaximumHeight: number = 0;
        //public MaximumWidth: number = 0;

		// Set the PopUpControlId to the id of the HTML element to use to 'popup' (display) this control.  
		// Setting this will indicate that this control is a popup and this control won't be displayed
		// until the corresponding HTML element is 'clicked'.
        public PopUpControlId: string = '';

		// PopUpPosition and PopUpDirection allow you to place the control relative to the popup HTML
		// element indicated by PopUpControlId.  Possible values for PopUpPosition are 'Left', 'Right',
		// 'Above', and 'Below'.  Possible values for PopUpDirection are 'Up' and 'Down'.  The default
		// is 'Right' and 'Down';
        public PopUpPosition: string = 'right';
        public PopUpDirection: string = 'down';

		// OutputElementId is the id of an element where the results, or selection(s), of the control
		// will be placed.  For example, the date when a date is selected or the selected values of a
		// checkbox control (separated by commas).  Use a hidden field if you want to retrieve the 
		// results on the server without displaying them.
        public OutputElementId: string;

		// Assign a css class name to the parent-level (just under BaseElement) HTML table.
        public TableCssClass: string;

		// popupOffset is the amount of buffer space between the element used to popup this control and
		// the control itself.
        private popupOffset: number = 3;
        private popupElement: HTMLElement;

        public events: ZenithEvent[] = new Array();

        // ===============  Constructor  ====================================================
        constructor (baseDivElementId: string)
        {
            if (baseDivElementId.length <= 0)
                throw Error("The id of a 'div' HTML element must be passed to the Zenith control when creating.");

            this.BaseElement = document.getElementById(baseDivElementId);

			if (!this.BaseElement)
				throw Error("The id of the 'div' HTML element passed in is not valid.");

            if (!(this.BaseElement instanceof HTMLDivElement))
                throw Error("The element associated with the Zenith control must be a div element.");
			
            this.BaseElement.style.borderColor = '#B6B8BA';
            this.BaseElement.style.borderWidth = '1px';
            this.BaseElement.style.borderStyle = 'solid';
        }
		
        // ===============  Public Methods  ====================================================
		
		// Called by the client app or by this control itself to hide the control and execute any events 
		// of type 'Close'.
        public Close()
        {
			this.ExecuteEvent(ZenithEvent.EventType.Close);

			if (this.BaseElement)
				this.BaseElement.style.visibility = 'collapse';
		}

        public addZenithEventListener(eventType: number, listener: Function)
        {
        	this.events.push(new ZenithEvent(eventType, listener));
        }

        public removeZenithEventListener(eventType: number, listener: Function)
        {
        	for (var index = 0; index < this.events.length; index++)
				if (this.events[index].eventType == eventType)
					this.events.splice(index, 1);
        }

        // ===============  Protected Methods  ====================================================
		// NOTE!
		// The following functions should be protected but TypeScript (JavaScript) doesn't have
		// protected support (yet).  Only derived class should use these methods (not users of
		// the controls).

        public Build()
        {
			var popupElement: HTMLElement = document.getElementById(this.PopUpControlId);

			this.BaseElement.style.overflowY = 'auto';
			this.BaseElement.style.overflowX = 'hidden';

			var baseWidth: number = this.ParentElement.clientWidth;
			if (this.MaximumHeight > 0 && this.MaximumHeight < this.ParentElement.clientHeight)
				baseWidth += this.getScrollerWidth();
			this.BaseElement.style.width = baseWidth.toString() + 'px';

			if (this.MaximumHeight > 0)
				this.BaseElement.style.maxHeight = this.MaximumHeight + 'px';

			//if (this.MaximumWidth > 0)
			//	this.BaseElement.style.maxWidth = this.MaximumWidth + this.getScrollerWidth() + 'px';

			if (this.popupElement)
				this.BaseElement.style.visibility = 'collapse';
        }

		// The SetPopup method will set the appropriate position of the control when the control is
		// a popup control.  The position is based on the element with the id in the PopUpControlId
		// base class variable.  The PopupPosition and PopUpDirection base class variables determine
		// where the controls should be positioned relative to this.
        public SetPopup(): void
        {
            this.popupElement = document.getElementById(this.PopUpControlId);
            if (this.popupElement)
            {
                this.addEventListener(document, 'keydown', (event) => 
				{
                	var keyEvent: KeyboardEvent = <KeyboardEvent>event;
					if ((event && keyEvent.keyCode) && keyEvent.keyCode == 27 || (window.event && window.event.keyCode && window.event.keyCode == 27))
						if (this.BaseElement.style.visibility == 'visible')
							this.Close();
				});

                this.addEventListener(document, 'click', (event) => 
				{
            		var mouseEvent: MouseEvent = <MouseEvent>event;
					// The srcElement on the event will be correct for IE and Chrome but it doesn't exist in FF.  For that
					// I check the document.activeElement.
            		var targetElement: HTMLElement = <HTMLElement>mouseEvent.srcElement;
					if (!targetElement)
						targetElement = <HTMLElement>document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);
					if (targetElement)
            		{
            			if (this.BaseElement.style.visibility == 'visible')
            			{
            				while (targetElement && targetElement != this.BaseElement && targetElement != document.documentElement)
            					targetElement = targetElement.parentElement;
            				if (targetElement && targetElement == document.documentElement)
            					this.Close();
            			}
            			else if (this.popupElement == targetElement)
            				this.OnPopupElement();
            		}
				});

                this.addEventListener(this.BaseElement, 'mouseout', (event) =>
                {
                	var mouseEvent: MouseEvent = <MouseEvent>event;
            		var targetElement: HTMLElement = <HTMLElement>mouseEvent.toElement;
					if (!targetElement)
						targetElement = <HTMLElement>document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);
                	if (targetElement)
                	{
                		// The onmouseout event will happen event when leaving an element inside the element 
                		// the event is tied to.
                		while (targetElement && targetElement != this.BaseElement)
                			targetElement = targetElement.parentElement;
                		if (targetElement != this.BaseElement)
                			this.Close();
                	}
                });

                this.BaseElement.style.position = 'absolute';
				this.BaseElement.style.zIndex = '10000';

                var positions: number[] = this.findAbsolutePosition(this.popupElement);
                var popupAbsLeft: number = positions[0];
                var popupAbsTop: number = positions[1];

                var position: string = this.PopUpPosition.toUpperCase();
                var direction: string = this.PopUpDirection.toUpperCase();

                // Calculate top position
                var top: number;
                if (position == 'ABOVE')
                {
                    if (direction == 'UP')
                        top = popupAbsTop - this.popupOffset - this.BaseElement.offsetHeight;
                    else
                        top = popupAbsTop - this.popupOffset, screen.availHeight;
                }
                else if (position == 'BELOW')
                {
                    if (direction == 'UP')
                        top = popupAbsTop + this.popupOffset + this.popupElement.offsetHeight - this.BaseElement.offsetHeight;
                    else
                        top = popupAbsTop + this.popupOffset + this.popupElement.offsetHeight;
                }
                else
                {
                    if (direction == 'UP')
                        top = popupAbsTop + this.popupElement.offsetHeight - this.BaseElement.offsetHeight;
                    else
                        top = popupAbsTop;
                }

                if (top + this.BaseElement.offsetHeight > screen.availHeight)
                    top = screen.availHeight - this.BaseElement.offsetHeight;
                if (top < 0) top = 0;
                this.BaseElement.style.top = top + 'px';

                // Calculate left position
                var left: number;

                if (position == 'ABOVE' || position == 'BELOW')
                    left = popupAbsLeft + (this.popupElement.offsetWidth / 2) - (this.BaseElement.offsetWidth / 2), 0;
                else if (position == 'LEFT')
                    left = popupAbsLeft - this.popupOffset - this.BaseElement.offsetWidth;
                else
                    left = popupAbsLeft + this.popupElement.offsetWidth + this.popupOffset;

                if (left + this.BaseElement.offsetWidth > screen.availWidth)
                    left = screen.availWidth - this.BaseElement.offsetWidth;
                if (left < 0) left = 0;
                this.BaseElement.style.left = left + 'px';
            }
            else
                throw new Error('Popup control with id ' + this.PopUpControlId + ' could not be found.');
        }
     
        public IsPopup(): bool
        {
        	return this.PopUpControlId.trim().length > 0;
        }

		// When the OutputElementName string is provided to this object the SetOutput method will
		// set the text of the element with an id of OutputElementName with the given value.
        public SetOutput(value: any, elementId?: string)
        {
        	var outputElement: HTMLElement = elementId && elementId.length > 0 ? document.getElementById(elementId) : this.OutputElementId && this.OutputElementId.length > 0 ? document.getElementById(this.OutputElementId) : null;
        	if (outputElement)
        	{
        		if (outputElement instanceof HTMLInputElement)
        			(<HTMLInputElement>outputElement).value = value ? value.toString() : '';
        		else
        			outputElement.textContent = value ? value.toString() : '';
        	}
        }

		// Remove all child elements from the base element.  Called before re-building the control.
        public Clear()
        {
        	while (this.BaseElement.firstChild)
				this.RemoveElement(<HTMLElement>this.BaseElement.firstChild);
        }

        private RemoveElement(element: HTMLElement)
        {
        	while (element.firstChild)
        		this.RemoveElement(<HTMLElement>element.firstChild);

        	if (element.parentElement)
        		element.parentElement.removeChild(element);
        	else if (element.parentNode)
        		element.parentNode.removeChild(element);
        }

        public ExecuteEvent(eventType: number, eventParms?: any[])
        {		
            for (var index = 0; index < this.events.length; index++)
				if (this.events[index].eventType == eventType)
					if (this.events[index].listener)
						this.events[index].listener.apply(this, eventParms);
        }

		public addEventListener(element : any, event: string, listener: EventListener)
		{
			if (element.addEventListener)
				element.addEventListener(event, listener);
			else if (element.attachEvent)
				element.attachEvent(event, listener);
		}

        // ===============  Private Methods  ====================================================

		private findAbsolutePosition(obj) 
		{
			var curleft: number = 0;
			var curtop: number = 0;
			if (obj.offsetParent) 
			{
				do 
				{
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				} 
				while (obj = obj.offsetParent);
			}
			return [curleft, curtop];
		}
	
		private OnPopupElement()
		{
			if (this.BaseElement.style.visibility == 'visible')
				this.Close();
			else
			{
				this.BaseElement.style.visibility = 'visible';
				this.ParentElement.focus();
			}
		}

		// This method will return the width of a scrollbar.
		private getScrollerWidth(): number
		{
			// Outer scrolling div
			var scr = document.createElement('div');
			scr.style.position = 'absolute';
			scr.style.top = '-1000px';
			scr.style.left = '-1000px';
			scr.style.width = '100px';
			scr.style.height = '50px';

			// Start with no scrollbar
			scr.style.overflow = 'hidden';

			// Inner content div
			var inn = document.createElement('div');
			inn.style.width = '100%';
			inn.style.height = '200px';

			// Put the inner div in the scrolling div
			scr.appendChild(inn);

			// Append the scrolling div to the doc 
			document.body.appendChild(scr);

			// Width of the inner div sans scrollbar
			var wNoScroll = inn.offsetWidth;

			// Add the scrollbar
			scr.style.overflow = 'auto';

			// Width of the inner div width scrollbar
			var wScroll = inn.offsetWidth;

			// Remove the scrolling div from the doc
			document.body.removeChild(
			document.body.lastChild);

			// Pixel width of the scroller
			return (wNoScroll - wScroll);
		}
	}

	// The ListItem class is a helper class used to store a value with an associated name/description.
	// For example, used to store the information for an item in a checkbox.
    export class ListItem
    {
        public Value: string;
        public Text: string;
		
        constructor (value: string, text: string) { this.Value = value; this.Text = text; }
    }

	// The ZenithEvent class is used to store and process any events associated with the control.  The
	// user can add 0 or more events for each event type to the Zenith control.  Examine the EventType
	// static property to determine the superset of available Zenith events across all Zenith controls 
	// and look at the documentation for the appropriate control to determine which of these events
	// are applicable for that control.
    export class ZenithEvent
    {
		public static EventType = { Selected: 1, Close: 2 };

    	public eventType: number;
    	public listener: Function;

        constructor (eventType: number, listener: Function) { this.eventType = eventType; this.listener = listener; }
    }

	export function Zenith_SortObjectsByKey(objects, key, sortOrder)
	{
		objects.sort(function ()
		{
			return function (a, b)
			{
				var objectIDA = a[key].toUpperCase();
				var objectIDB = b[key].toUpperCase();
				if (objectIDA === objectIDB)
					return 0;
				if (sortOrder == 'asc')
					return objectIDA > objectIDB ? 1 : -1;
				else
					return objectIDA < objectIDB ? 1 : -1;
			};
		} ()); 
	} 

}

String.prototype.trim = function() {return this.replace(/^\s+|\s+$/g,"");} 
