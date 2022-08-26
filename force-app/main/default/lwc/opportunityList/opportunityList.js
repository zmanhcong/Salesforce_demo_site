import { LightningElement, wire,api } from "lwc";
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOpportunities from "@salesforce/apex/OpportunityList.getOpportunities";
import { updateRecord } from 'lightning/uiRecordApi';

const OPPORTUNITY_COLS = [
	{
		label: "Opportunity Name",
		type: "button",
		typeAttributes: { label: { fieldName: "Name" }, name: "gotoOpportunity", variant: "base" },
        editable: true ,
	},
	{
		label: "Stage",
		fieldName: "StageName",
        editable: true,
	},
	{
		label: "Amount",
		fieldName: "Amount",
		type: "currency",
        editable: true,
	},
	{ label: "Close Date", type: "date", fieldName: "CloseDate",editable: true },
	{ label: "Description", fieldName: "Description",editable: true, type: "text"  },
	{
		label: "Delete",
		type: "button",
		typeAttributes: {
			label: "Delete",
			name: "deleteOpportunity",
			variant: "destructive"
		},
	}
];

export default class RefreshApexDelete extends LightningElement {
	opportunityCols = OPPORTUNITY_COLS;

	//@wire(getOpportunities, {})
	opportunities = [];
    saveDraftValues = [];

    //Pagination
    //@api recordId;
    //opportunities = [];
    page = 1; 
    items = []; 
    //columns = OPPORTUNITY_COLS; 
    startingRecord = 1; 
    endingRecord = 0; 
    pageSize = 5; 
    totalRecountCount = 0; 
    totalPage = 0; 
  
    get isFirstPage() {
      return this.page === 1;
    }
  
    get isLastPage() {
      return this.page === this.totalPage;
    }
  
    @wire(getOpportunities)
    wiredOpportunity({data, error}) {
      if(data) {
        this.items = data;
        this.totalRecountCount = data.length;
        this.totalPage = Math.ceil(this.totalRecountCount/this.pageSize);
        this.opportunities = this.items.slice(0, this.pageSize);
        this.endingRecord = this.pageSize;
      } else if(error) {
        console.log('error' + error);
      }
    }

    //Realtime search function
    searchValue;
    handleSearch(event){
        this.searchValue = event.target.value;
        this.ImperativeCall();
    }

    ImperativeCall(){
        getOpportunities({str:this.searchValue})
        .then ((result) => {     
            //this.opportunities = result;
            this.items = result;
            this.totalRecountCount = result.length;
            this.totalPage = Math.ceil(this.totalRecountCount/this.pageSize);
            this.opportunities = this.items.slice(0, this.pageSize);
            this.endingRecord = this.pageSize;
            refreshApex(this.opportunities);
        })
        .catch((error) =>{
            console.log('has error'+error);
        })  
    }

    previousHandler() {
      if(this.page > 1) {
        this.page -= 1;
        this.changePageHandler(this.page);
      }
    }
  
    nextHandler() {
      if(this.page < this.totalPage) {
        this.page += 1;
        this.changePageHandler(this.page);
      }
    }
  
    changePageHandler(page) {
      this.startingRecord = ((page - 1) * this.pageSize);
      this.endingRecord = (page * this.pageSize);
      if((page * this.pageSize) > this.totalRecountCount) {
        this.endingRecord = this.totalRecountCount;
      } else {
        this.endingRecord = page * this.pageSize;
      }
  
      this.opportunities = this.items.slice(this.startingRecord, this.endingRecord);
      this.startingRecord += 1;
    }


    //Delete record
	handleRowAction(event) {
		if (event.detail.action.name === "deleteOpportunity") {
			deleteRecord(event.detail.row.Id).then(() => {
				refreshApex(this.opportunities);
				this.dispatchEvent(
					new ShowToastEvent({
						title: 'Success',
						message: "Record deleted successfully!",
						variant: 'success'
					})
				);
			}).catch((error) => {
				console.log("error, " + error);
				this.dispatchEvent(
					new ShowToastEvent({
						title: 'Error deleting record',
						message: error.body.message,
						variant: 'error'
					})
				);
			})
		}
        
	}

    // 子から親をコール　（確認要） 
    ReloadPag() {
        refreshApex(this.opportunities);
    }

    //Show modal for create new Opp
    handleShowModal() {
        const modal = this.template.querySelector("c-modal-Popup");
        modal.show();
    }

    //Inline edit record (return draft, with each draft -> import inside {})
    saveHandleAction(event) {
        this.fldsItemValues = event.detail.draftValues;
        const inputsItems = this.fldsItemValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = inputsItems.map(recordInput => updateRecord(recordInput));
        //Debug log
        console.log('value of fldsItemValues=event.detail.draftValues is : '+JSON.stringify(event.detail.draftValues));
        console.log('value of inputsItems is : '+JSON.stringify(inputsItems));
        console.log('value of promises is : '+JSON.stringify(promises));

        Promise.all(promises)
        .then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.fldsItemValues = [];
            return this.refresh();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.fldsItemValues = [];
        });
    }

    async refresh() {
        await refreshApex(this.accObj);
    }

}