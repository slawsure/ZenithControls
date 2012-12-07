/******************************************************************************************
 * Developed by Shawn Lawsure - shawnl@maine.rr.com - http://www.linkedin.com/in/shawnlawsure

 * The Grid class supports the following functionality:
        -> Use JSON object as the data source.
        -> Row selection.
        -> Row identifier (i.e. data key name).
        -> Sorting by clicking on the column header (not applicable when grouping).
        -> Alternate row display.
        -> Scroll bars.
        -> Group/display by a given group field (see below).

 * Future potential enhancements:
        -> Paging
        -> Fixed-header when scrolling.

 * Example of use:

            // Use the following JSON object as the data source.
            var testData = [
                { "Id": 22, "make": "Honda", "model": "CR-V", "year": "1998" },
                { "Id": 23, "make": "Toyota", "model": "Sienna", "year": "2005" },
                { "Id": 24, "make": "Nissan", "model": "Sentra", "year": "2001" },
                { "Id": 25, "make": "Toyota", "model": "Corolla", "year": "2011" },
                { "Id": 26, "make": "Ford", "model": "Focus", "year": "2008" },
                { "Id": 27, "make": "Dodge", "model": "Charger", "year": "2004" },
                { "Id": 28, "make": "Ford", "model": "Fiesta", "year": "2013" },
                { "Id": 29, "make": "Toyota", "model": "Camry", "year": "2008" },
                { "Id": 30, "make": "Dodge", "model": "Durango", "year": "2004"}];

            // Call the constructor.            
            var myGrid = new Zenith.Grid('baseElement', testData);

            // Now, set the rest of the public properties on the Grid object as necessary before
            // calling the Build function.

            myGrid.BindFields =
                [
                    { "FieldName": "make", "Header": "Make", "Width": 150 },
                    { "FieldName": "model", "Header": "Model", "Width": 150 },
                    { "FieldName": "year", "Header": "Year", "Width": 50 }
                ];
            myGrid.DataKeyName = 'Id';

            myGrid.PopUpControlId = 'testPopup';
            myGrid.PopUpPosition = 'right';
            myGrid.PopUpDirection = 'down';

            myGrid.IsSelectable = true;
            myGrid.IsSortable = true;
            myGrid.GroupedByKeyName = 'make';
            myGrid.GroupExpandImage = true;
            myGrid.MaximumHeight = 100;
            myGrid.OutputElementId = 'output1';

            myGrid.addZenithEventListener(Zenith.ZenithEvent.EventType.Selected, function (row, rowValue, rowIndex) { alert('rowValue = ' + rowValue + ' : rowIndex = ' + rowIndex); });

            myGrid.Build();

            myGrid.ParentElement.className = 'gridJS';


		* CSS Class Names (hard-coded) - set these in your own CSS file:

			> ZenithGridTable
			> ZenithGrid_SelectedRow
			> ZenithGrid_AltRow 
			> ZenithGrid_GroupRow

    });
******************************************************************************************/

///<reference path='ZenithControlBase.ts'/>

module Zenith
{
	export class Grid extends Zenith.ControlBase
	{
        // ===============  Public Attributes  ==================================================

		// DataSource is the JSON object that will act as the data source.  This is required.
		public DataSource: Array;

		// The BindFields property is required and must contain FieldName and Header values for each
		// column you want displayed in the grid where FieldName is the corresponding field in
		// the JSON object data source (above) and Header is the title you want displayed as the 
		// column header for that column.  The Width field is not necessary but it helps to lineup 
		// the columns when grouping rows (see below).
		public BindFields: Array;

		// The dataKeyName property is the name of the field in the JSON object that contains the
		// identifying key for each row in the data source (e.g. primary key value).  This is
		// required if you want to be able to get the key for the selected row.
		public DataKeyName: string = '';

		// IsSelectable indicates that the user can select a row.  The row will be highlighted and
		// the 'selected' attribute will be set for that row.  Default is true;
		public IsSelectable: bool = true;

		// IsSortable indicates that the rows can be sorted by clicking on the column headers (both
		// ascending and descending).  This is not applicable when grouping by rows (see below). 
		// Default is true.
		public IsSortable: bool = true;

		// Set the GroupedByKeyName to have the grid be grouped by the given JSON object field from
		// the data source and allow the user to show and collapse the grouped rows.  When first
		// displaying the screen only the unique values for the GroupedByKeyName field will be
		// shown in the grid.  When the user clicks on one of these rows the grouped rows will be
		// displayed below the clicked row.
		public GroupedByKeyName: string = '';

		// When grouping set the GroupExpandImage to true if you want to display an collapse/expand image.
		public GroupExpandImage: bool = false;

        // ===============  Private Attributes  ==================================================
		private sortOrder: string = '';
		private sortName: string = '';
		private groupedFieldCellIndex: number = 0;

        // ===============  Constructor  =========================================================
        constructor (baseDivElementId: string, dataSource: Array)
        {
        	super(baseDivElementId);
            this.DataSource = dataSource;
        }

        // ===============  Public Methods  ====================================================

		public Build(): void
		{
            this.Clear();

			var isGrouped: bool = this.GroupedByKeyName && this.GroupedByKeyName.length > 0;

			if (isGrouped)
				Zenith_SortObjectsByKey(this.DataSource, this.GroupedByKeyName, "asc");
			else if (this.IsSortable && this.sortName.length > 0)
				Zenith_SortObjectsByKey(this.DataSource, this.sortName, this.sortOrder);

			var th: HTMLTableHeaderCellElement, td: HTMLTableCellElement, trow: HTMLTableRowElement;

            var table: HTMLTableElement = <HTMLTableElement>document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithGridTable';

            this.ParentElement = table;

			var thead: HTMLElement = document.createElement('thead');
            table.appendChild(thead);
			
			//==============================================================================================
			// Header row
			//==============================================================================================
			var headerRow: HTMLTableRowElement = <HTMLTableRowElement>document.createElement('tr');
            thead.appendChild(headerRow);

			// Collapse/expand column for grouping
			if (this.GroupExpandImage)
			{
				th = <HTMLTableHeaderCellElement>document.createElement('th');
				headerRow.appendChild(th);
				th.style.width = '17px';
			}

			for (var key in this.BindFields)
			{
				var fieldName: string = this.BindFields[key].FieldName;
				if (fieldName)
				{
					th = <HTMLTableHeaderCellElement>document.createElement('th');
					headerRow.appendChild(th);
					th.id = fieldName;
					th.textContent = this.BindFields[key].Header;

					if (fieldName == this.DataKeyName || (this.BindFields[key].Hidden && this.BindFields[key].Hidden == true))
						th.style.display = 'none';
					else
					{
						if (this.IsSortable && !isGrouped)
							th.addEventListener('click', (event: Event) =>
							{
								this.sortOrder = this.sortOrder == 'asc' ? 'desc' : 'asc';
								this.sortName = (<HTMLElement>event.currentTarget).id;
								this.Build();
							});

						if (this.BindFields[key].Width)
							th.style.width = this.BindFields[key].Width + "px";
					}
				}
			}

			//==============================================================================================
			// Body
			//==============================================================================================
			var tbody: HTMLElement = document.createElement('tbody');
            table.appendChild(tbody);

			var currenttbody: HTMLElement;
			var groupRowIndex: number = 0;
			var inGroup: bool = false;
			for (var index = 0; index < this.DataSource.length; index++)
			{
				// The following logic is used when grouping rows.
				if (isGrouped)
				{
					if (index == 0 || this.DataSource[index - 1][this.GroupedByKeyName].toUpperCase() != this.DataSource[index][this.GroupedByKeyName].toUpperCase())
					{
						groupRowIndex++;

						currenttbody = document.createElement('tbody');
						table.appendChild(currenttbody);

						if (index == this.DataSource.length - 1 || this.DataSource[index][this.GroupedByKeyName].toUpperCase() != this.DataSource[index + 1][this.GroupedByKeyName].toUpperCase())
							inGroup = false;
						else
						{
							inGroup = true;
							var numColumns: number = 0;
							var groupRow: HTMLTableRowElement = <HTMLTableRowElement>document.createElement('tr');
							groupRow.setAttribute('groupRow', 'true');
							currenttbody.appendChild(groupRow);
							groupRow.addEventListener('click', (event: Event) => 
							{
								if (event.currentTarget instanceof HTMLTableRowElement)
								{
									var groupRow: HTMLTableRowElement = <HTMLTableRowElement>event.currentTarget;
									var expand: bool = true;
									if (groupRow.parentElement && groupRow.parentElement.nextSibling)
									{
										var nextBody: HTMLTableElement = <HTMLTableElement>groupRow.parentElement.nextSibling;
										if (nextBody)
										{
											if (nextBody.style.display == 'none')
											{
												expand = true;
												nextBody.style.display = '';
											}
											else
											{
												expand = false;
												nextBody.style.display = 'none';
											}
											groupRow.setAttribute('expanded', expand ? 'true' : 'false');
											this.SetRowClass();
										}
									}
									if (this.GroupExpandImage)
									{
										var images: NodeList = groupRow.cells[0].getElementsByTagName('img');
										if (expand)
										{
											(<HTMLImageElement>images[1]).style.display = 'inline';
											(<HTMLImageElement>images[0]).style.display = 'none';
										}
										else
										{
											(<HTMLImageElement>images[1]).style.display = 'none';
											(<HTMLImageElement>images[0]).style.display = 'inline';
										}
									}
								}
							});
							groupRow.tabIndex = groupRowIndex;

							if (this.GroupExpandImage)
							{
								td = <HTMLTableCellElement>document.createElement('td');
								groupRow.appendChild(td);
								td.style.width = '17px'

								var expandImage: HTMLImageElement = <HTMLImageElement>document.createElement('img');
								td.appendChild(expandImage);
								expandImage.src = 'expand.png';

								var collapseImage: HTMLImageElement = <HTMLImageElement>document.createElement('img');
								td.appendChild(collapseImage);
								collapseImage.src = 'collapse.png';
								collapseImage.style.display = 'none';
							}
							groupRow.style.cursor = 'pointer';

							for (var key in this.BindFields)
							{
								var fieldName: string = this.BindFields[key].FieldName;
								if (fieldName)
								{
									td = <HTMLTableCellElement>document.createElement('td');
									groupRow.appendChild(td);
									if (fieldName == this.GroupedByKeyName)
									{
										td.textContent = this.DataSource[index][fieldName];
										if (this.BindFields[key].Width)
											td.style.width = this.BindFields[key].Width + "px";
									}

									if (fieldName == this.DataKeyName || (this.BindFields[key].Hidden && this.BindFields[key].Hidden == true))
										td.style.display = 'none';
									else
										numColumns++;
								}
							}

							currenttbody = <HTMLElement>document.createElement('tbody');
							table.appendChild(currenttbody);
							currenttbody.style.display = "none";
						}
					}
				}
				else if (currenttbody == null)
				{
					currenttbody = <HTMLElement>document.createElement('tbody');
					table.appendChild(currenttbody);
				}

				// Item row
				trow = <HTMLTableRowElement>document.createElement('tr');
				currenttbody.appendChild(trow);
				trow.tabIndex = groupRowIndex;
				if (inGroup)
					trow.setAttribute('inGroup', 'true');

				if (this.GroupExpandImage)
				{
					td = <HTMLTableCellElement>document.createElement('td');
					trow.appendChild(td);
					td.style.width = '17px';
				}

				for (var key in this.BindFields)
				{
					var fieldName = this.BindFields[key].FieldName;
					if (fieldName)
					{
						td = <HTMLTableCellElement>document.createElement('td');
						trow.appendChild(td);
						td.id = fieldName;
						td.innerHTML = this.DataSource[index][fieldName] ? this.DataSource[index][fieldName] : '';

						if (fieldName == this.DataKeyName || this.BindFields[key].Hidden && this.BindFields[key].Hidden == true)
							td.style.display = 'none';
						else if (this.BindFields[key].Width)
							td.style.width = this.BindFields[key].Width + "px";
					}
				}

				if (this.IsSelectable)
				{
					trow.addEventListener('click', (event: Event) => { this.selectedEventHandler(event); });

					if (this.DataKeyName.length > 0)
						trow.setAttribute('keyValue', this.DataSource[index][this.DataKeyName]);
				}
			}

			table.style.cursor = this.IsSelectable ? 'pointer' : "";

			this.SetRowClass();

			if (this.IsPopup())
				super.SetPopup();

			super.Build();
		}

        // ===============  Private Methods  ====================================================

		private SetRowClass(selectedRow?: HTMLTableRowElement): void
		{		
			var rows: NodeList = this.ParentElement.getElementsByTagName('tr');
			for (var index = 0; index < rows.length; index++)
			{
				var row: HTMLTableRowElement = <HTMLTableRowElement>rows[index];

				if (this.IsSelectable && selectedRow)
					row.setAttribute('selected', selectedRow == row ? 'true' : 'false');

				if (this.IsSelectable && row.attributes['selected'] && row.attributes['selected'].value == 'true')
					row.className = 'ZenithGrid_SelectedRow';				
				else if ((row.attributes['inGroup'] && row.attributes['inGroup'].value == 'true') || (row.attributes['groupRow'] && row.attributes['groupRow'].value == 'true' && row.attributes['expanded'] && row.attributes['expanded'].value == 'true'))
					row.className = 'ZenithGrid_GroupRow';
				else if (index % 2 == 0)
					row.className = 'ZenithGrid_AltRow';
				else
					row.className = 'ZenithGrid_UnselectedRow';
			}
		}

        // ===============  Event Handlers  ====================================================

		private selectedEventHandler(event)
		{
			var trow: HTMLTableRowElement = <HTMLTableRowElement>event.currentTarget;
			this.SetRowClass(trow);

			this.SetOutput(trow.getAttribute('keyValue'));

			if (this.IsSelectable)
				super.ExecuteEvent(ZenithEvent.EventType.Selected, [event.currentTarget, trow.getAttribute('keyValue'), trow.rowIndex]);

			if (this.IsPopup())
				super.Close();
		}

	}
}
