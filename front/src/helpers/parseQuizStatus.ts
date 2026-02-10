export function parseQuizStatus(data: string){
    switch(String(data)){
        case '1':
            return "Pending";
        case '2':
            return "Approved";
        case '3':
            return "Rejected";
        default:
            return "Error";  
    }
}