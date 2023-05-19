import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  CompositeFilterDescriptor,
  filterBy,
  FilterDescriptor,
} from '@progress/kendo-data-query';
import { sampleProducts } from './products';
import {
  GridComponent,
  GridDataResult,
  RowArgs,
  SelectableSettings,
} from '@progress/kendo-angular-grid';

@Component({
  selector: 'my-app',
  template: `
        <div class="example-config">
            <input #findThis (keyup)="handleKeyup($event)" placeholder="find..." [(ngModel)]="filterText">
            <pre>Selected: {{this.selectedItem?.ProductName}}</pre>
            <pre>this.gridView.data.length: {{this.gridView.data.length}}</pre>
            <pre>this.itemIndex: {{this.itemIndex}}</pre>
        </div>

        <kendo-grid 
        [data]="gridView"
        [pageable]="false"
        [navigable]="true"
        [height]="500"
        [selectable]="{enabled: true, mode: 'single'}"
        kendoGridSelectBy="ProductID"
        [(selectedKeys)]="mySelection"
        (selectedKeysChange)="selectId($event)"
        (selectionChange)="changeSelection($event)"
        (dblclick)="onDblClick($event)"
        #grid       
        >    
            <kendo-grid-column field="ProductName" title="Product Name" [width]="150"> </kendo-grid-column>
            <kendo-grid-column field="FirstOrderedOn" title="First Ordered On" [width]="240" filter="date" format="{0:d}">
            </kendo-grid-column>
            <kendo-grid-column field="UnitPrice" title="Unit Price" [width]="180" filter="numeric" format="{0:c}"> </kendo-grid-column>
            <kendo-grid-column field="Discontinued" [width]="120" filter="boolean">
                <ng-template kendoGridCellTemplate let-dataItem>
                    <input type="checkbox" [checked]="dataItem.Discontinued" disabled />
                </ng-template>
            </kendo-grid-column>
        </kendo-grid>
    `,
  styles: [
    `
            .window-content {
                display: flex;
                flex-direction: column;
            }
        `,
  ],
})
export class AppComponent {
  @ViewChild('findThis', { static: false }) findThis: ElementRef;
  @ViewChild('grid') public grid: GridComponent;
  public gridView: GridDataResult;
  public items: any[] = sampleProducts;
  public itemIndex = 0;
  public mySelection: number[] = [1];
  public pageSize = 500;
  public filterText;
  public selectedItem;

  constructor() {
    this.loadItems();
    if(this.items)
      this.selectedItem = this.items[0];
  }

  ngAfterViewInit() {
    //disabilitare se si vuole editare roba qui
    //this.findThis?.nativeElement.focus();
  }

  //funziona sul click singolo sulla riga (selezione)
  selectId(e) {
    console.log('selectId', e);
  }

  //funziona sul click singolo sulla riga (selezione)
  changeSelection(item) {
    if (item.selectedRows[0]) {
      this.selectedItem = item.selectedRows[0].dataItem;
      console.log('changeSelection', item.selectedRows[0].dataItem);
    }
  }

  onDblClick(e) {
    console.log('Double click-->close the window (maybe)');
  }

  // Sposta lo scroll della griglia all'elemento selezionato
  private scrollToSelected() {
    if (!this.selectedItem) return;

    const selectedRowIndex = this.gridView.data.indexOf(this.selectedItem);
    this.grid.scrollTo({ row: selectedRowIndex, column: 0 });
  }

  // Seleziona l'elemento precedente/successivo
  private moveSelection(next = true) {
    const selectedRowIndex = this.gridView.data.indexOf(this.selectedItem);
    const offset = next ? 1 : -1;

    if (this.selectedItem) {
      this.selectedItem = this.gridView.data[selectedRowIndex + offset];
    } else {
      this.selectedItem = this.gridView.data[0];
    }
  }

  private loadItems(): void {
    if(this.items){
      this.gridView = {
        data: this.items,
        total: this.items.length,
      }
    }else{
      return;
    }
  }

  handleKeyup(event) {
    switch (event.key) {
      case 'ArrowUp': {
        if (this.itemIndex === 0) {
          return;
        }
        this.moveSelection(false);

        if (this.filterText) {
          this.applyFilter(this.filterText);
        } else {
          this.loadItems();
        }
        this.itemIndex = this.items.indexOf(this.selectedItem);
        this.mySelection = [this.itemIndex + 1];
        this.scrollToSelected();
        break;
      }

      case 'ArrowDown': {
        this.moveSelection(true);
        if (this.filterText) {
          this.applyFilter(this.filterText);
        } else {
          this.loadItems();
        }
        this.itemIndex = this.items.indexOf(this.selectedItem);
        this.mySelection = [this.itemIndex + 1];
        this.scrollToSelected();
        break;
      }

      case 'Enter': {
        break;
      }

      case 'ArrowLeft':
        break;
      case 'ArrowRight':
        break;

      default: {
        this.applyFilter(this.filterText);
        break;
      }
    }
  }

  public applyFilter(val): void {
    const filter: FilterDescriptor = {
      operator: 'contains',
      value: val,
      field: 'ProductName',
    };

    this.gridView.data = filterBy(sampleProducts, filter);

    if (this.gridView.data.length === 1) {
      this.selectedItem = this.gridView.data[0];
    }
  }
}
