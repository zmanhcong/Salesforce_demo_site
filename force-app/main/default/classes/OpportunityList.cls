public with sharing class OpportunityList{
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities(){
        return [
            SELECT Name, StageName, Amount, CloseDate, Description 
            FROM Opportunity 
            WHERE Name LIKE '%mnc%' ORDER BY ID ASC
            LIMIT 10 
        ];
    }

    // @AuraEnabled(cacheable=true)
    // public static List<Opportunity> newOpportunity(String name){
    //     Opportunity opp = new Opportunity();
    //     opp.CloseDate=date.today().addMonths(2);
    //     // Opp.Closedate= System.today();
    //     opp.Name= name;
    //     opp.StageName='Closed Won';
    //     insert opp;
    // }

    // @AuraEnabled
    // public static Account getAccount(Id accountId) {
    //     // Perform isAccessible() checks here
    //     return [SELECT Name, BillingCity, BillingState FROM Account WHERE Id = :accountId];
    // }
    
    // @AuraEnabled
    // public static Contact saveContactWithAccount(Contact contact, Id accountId) {
    //     // Perform isAccessible() and isUpdateable() checks here
    //     contact.AccountId = accountId;
    //     upsert contact;
    //     return contact;
    // }

}
