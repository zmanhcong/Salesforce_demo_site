import { LightningElement, wire,api } from "lwc";
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOpportunities from "@salesforce/apex/OpportunityList.getOpportunities";
import { updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import removeOpportunity from "@salesforce/apex/OpportunityList.deleteOpportunity";


const actions = [
  {label: 'View', name:'view'},
  {label: 'Edit', name:'edit'},
  {label: 'Delete', name:'delete'},
]
const OPPORTUNITY_COLS = [
	{
		label: "Opportunity Name",
		type: "button",
    label: "View",
		typeAttributes: { label: { fieldName: "Name" }, name: "gotoOpportunity", variant: "base" },
        editable: true ,
	},
	{
		label: "Stage",
		fieldName: "StageName",
        type:'picklist',
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
	// {
	// 	label: "Delete",
	// 	type: "button",
	// 	typeAttributes: {
	// 		label: "Delete",
	// 		name: "deleteOpportunity",
	// 		variant: "destructive"
	// 	},
	// },
  {
    label: "Actions",
    type: "action",
		typeAttributes: {
      rowActions:actions,
      menuAligment:'right'
     }
	},
];



export default class Mainfunction extends NavigationMixin (LightningElement) {
	opportunityCols = OPPORTUNITY_COLS;

    opportunities;
    saveDraftValues = [];

    //Pagination
    //@api recordId;
    page = 1; 
    items = [];
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

    previousHandler(){
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
      
    firstHandler(){
      this.page = 1;
      this.changePageHandler(this.page);
    }

    lastHandler(){
      this.page = this.totalPage;
      this.changePageHandler(this.page);
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



    // ?????????????????????????????????????????? 
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
                    message: 'Opportunity Updated Successfully!!',
                    variant: 'success'
                })
            );
            getOpportunities({str:'', ntime:Date.now()}).then(data=> {
              if(data) {
                this.items = data;
                this.totalRecountCount = data.length;
                this.totalPage = Math.ceil(this.totalRecountCount/this.pageSize);
                this.opportunities = this.items.slice(0, this.pageSize);
                this.endingRecord = this.pageSize;

                refreshApex(this.opportunities);
              } else if(error) {
                console.log('error' + error);
              }
            }).
            catch()

            this.fldsItemValues = [];
            return this.refresh();
          }
        ).catch(error => {
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
        await refreshApex(this.opportunities);
    }
    

  //   async saveHandleAction(event) {
  //     // Convert datatable draft values into record objects
  //     const records = event.detail.draftValues.slice().map((draftValue) => {
  //         const fields = Object.assign({}, draftValue);
  //         return { fields };
  //     });

  //     // Clear all datatable draft values
  //     this.draftValues = [];

  //     try {
  //         // Update all records in parallel thanks to the UI API
  //         const recordUpdatePromises = records.map((record) =>
  //             updateRecord(record)
  //         );
  //         await Promise.all(recordUpdatePromises);

  //         // Report success with a toast
  //         this.dispatchEvent(
  //             new ShowToastEvent({
  //                 title: 'Success',
  //                 message: 'opportunity updated',
  //                 variant: 'success'
  //             })
  //         );

  //         // Display fresh data in the datatable
  //         await refreshApex(this.opportunities);
  //     } catch (error) {
  //         this.dispatchEvent(
  //             new ShowToastEvent({
  //                 title: 'Error updating or reloading opportunity',
  //                 message: error.body.message,
  //                 variant: 'error'
  //             })
  //         );
  //     }
  // }


  handleRowAction(event){
    const actionName = event.detail.action.name;
    //console.log('Event action name', actionName);
    const row = event.detail.row;
    switch(actionName){
      case 'view':
          this[NavigationMixin.Navigate]({
            type:'standard__recordPage',
            attributes:{
              recordId:row.Id,
              actionName:'view',
              abjectApiName:'Opportunity'
            }
          });
          break;
      case 'edit':
        this[NavigationMixin.Navigate]({
          type:'standard__recordPage',
          attributes:{
            recordId:row.Id,
            actionName:'edit',
            abjectApiName:'Opportunity'
          }
        });
        break;
    
    case 'delete':
        //this.removeOpportunity(row);

        // deleteRecord(event.detail.row.Id).then(() => {
        //   refreshApex(this.opportunities);
        //   this.dispatchEvent(
        //     new ShowToastEvent({
        //       title: 'Success',
        //       message: "Record deleted successfully!",
        //       variant: 'success'
        //     })
        //   );
        //   return refreshApex(this.opportunities);
        // }).catch((error) => {
        //   console.log("error, " + error);
        //   this.dispatchEvent(
        //     new ShowToastEvent({
        //       title: 'Error deleting record',
        //       message: error.body.message,
        //       variant: 'error'
        //     })
        //   );
        // })
        // break;

        console.log("event.detail.row", JSON.stringify(event.detail.row.Id));
        removeOpportunity({id: event.detail.row.Id})
        .then(result => {               
            this.dispatchEvent( 
                new ShowToastEvent({
                    title: 'Success',
                    message: 'OPP was deleted!',
                    variant: 'success',
                }),
            );    
            getOpportunities({str:'', ntime:Date.now()}).then(data=> {
              console.log('promise get opp');
              if(data) {
                this.items = data;
                this.totalRecountCount = data.length;
                this.totalPage = Math.ceil(this.totalRecountCount/this.pageSize);
                this.opportunities = this.items.slice(0, this.pageSize);
                this.endingRecord = this.pageSize;

                console.log("opportunities list is : ", JSON.stringify(this.opportunities));
                console.log("promise get data : ", JSON.stringify(this.items));

                refreshApex(this.opportunities);
              } else if(error) {
                console.log('error' + error);
              }
            }).catch()

           
    
        })
        .catch(error => {
            this.message = undefined;
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating records',
                    message: 'error',
                    variant: 'error',
                }),
            );
            console.log("error", JSON.stringify(this.error));
        });
        break;
    }
  }

  // removeOpportunity(currentRow){
  //   removeOpportunity({objopp:currentRow})
  //     .then((result)=>{
  //       this.dispatchEvent(new ShowToastEvent({
  //         title:'Success',
  //         message:'Opportunity deleted',
  //         variant:'success'
  //       }))
  //     })
  //     .catch((error)=>{
  //       this.dispatchEvent(new ShowToastEvent({
  //         title:'Error!!!',
  //         message:error,
  //         variant:'error'
  //       }))
  //     })
  // }

  
    //Delete record
	// handleRowAction(event) {
	// 	if (event.detail.action.name === "deleteOpportunity") {
	// 		deleteRecord(event.detail.row.Id).then(() => {
	// 			refreshApex(this.opportunities);
	// 			this.dispatchEvent(
	// 				new ShowToastEvent({
	// 					title: 'Success',
	// 					message: "Record deleted successfully!",
	// 					variant: 'success'
	// 				})
	// 			);
	// 		}).catch((error) => {
	// 			console.log("error, " + error);
	// 			this.dispatchEvent(
	// 				new ShowToastEvent({
	// 					title: 'Error deleting record',
	// 					message: error.body.message,
	// 					variant: 'error'
	// 				})
	// 			);
	// 		})
	// 	}
	// }

} 