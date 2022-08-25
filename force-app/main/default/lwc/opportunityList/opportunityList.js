import { LightningElement, wire } from "lwc";
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

	@wire(getOpportunities, {})
	opportunities;
    saveDraftValues = [];

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



    //Inline edit record
    saveHandleAction(event) {
        this.fldsItemValues = event.detail.draftValues;
        const inputsItems = this.fldsItemValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

       
        const promises = inputsItems.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
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