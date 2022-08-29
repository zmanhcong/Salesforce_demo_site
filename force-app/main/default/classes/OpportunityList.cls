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
   
    @AuraEnabled
    public static void deleteOpportunity(Id id){
        try {
            Opportunity opp = [SELECT Id FROM Opportunity WHERE Id =:id];
            delete opp;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}



    // @AuraEnabled
    // public static Contact saveContactWithAccount(Contact contact, Id accountId) {
    //     // Perform isAccessible() and isUpdateable() checks here
    //     contact.AccountId = accountId;
    //     upsert contact;
    //     return contact;
    // }


