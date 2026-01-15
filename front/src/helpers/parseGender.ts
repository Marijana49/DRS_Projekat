export function parseGender (input: string) {
    switch(String(input)){
        case '1':
            return "Male";
        case '2':
            return "Female";
        case '3':
            return "Other";
        default:
            return "error";
    }
}