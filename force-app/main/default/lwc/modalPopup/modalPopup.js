import { LightningElement, api, wire } from "lwc";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import NAME_FIELD from '@salesforce/schema/Opportunity.Name';
import STAGENAME_FIELD from '@salesforce/schema/Opportunity.StageName';
import CLOSEDATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';
import getOpportunities from "@salesforce/apex/OpportunityList.getOpportunities";
import { refreshApex } from '@salesforce/apex';

export default class Modal extends LightningElement {
  showModal = false;

  @api show() {
    this.showModal = true;
  }
  handleDialogClose() {
    this.showModal = false;
  }

  objectApiName = OPPORTUNITY_OBJECT;
  fields = [NAME_FIELD, STAGENAME_FIELD, CLOSEDATE_FIELD];
  
  //Reload page when created new a opportunity.
  @wire(getOpportunities, {})
  opportunities;

  handlesuccess(event) {
      const toastEvent = new ShowToastEvent({
          title: "Opportunity created",
          message: "Record ID: " + event.detail.id,
          variant: "success"
      });
      refreshApex(this.opportunities);
      this.dispatchEvent(toastEvent);
  }
      
}