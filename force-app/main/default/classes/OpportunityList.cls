public with sharing class OpportunityList{
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities(String str){
        
        if (str == '' || str == null){
            return [
            SELECT Name, StageName, Amount, CloseDate, Description 
            FROM Opportunity 
            ];
        }
        String name = '%' + str + '%';
            return [
            SELECT Name, StageName, Amount, CloseDate, Description 
            FROM Opportunity 
            WHERE Name LIKE :name ORDER BY ID ASC
        ];
        
        
    }



    // @AuraEnabled(cacheable=true)
    // public static List<Opportunity> serachTestRecord( String serachWord ){
    //     serachWord = serachWord.trim();
    //     if ( serachWord == null ) {
    //         return [
    //             SELECT Name, StageName, Amount, CloseDate, Description 
    //             FROM Opportunity 
    //             WHERE Name LIKE '%mnc%' ORDER BY ID ASC
    //         ];
    //     }
       
    //         serachWord = '%' + serachWord + '%';
    //     return [
    //         SELECT Name, StageName, Amount, CloseDate, Description 
    //         FROM Opportunity
    //         WHERE Name = :serachWord
    //         ];
        
        
    // }
    
}
    // @AuraEnabled(cacheable=true)
    // public static List<> newOpportunity(String name){
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


