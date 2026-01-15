export function parseRole (input?: string) {
    switch(String(input)){
        case '1':
            return "PLAYER";
        case '2':
            return "MODERATOR";
        case '3':
            return "ADMINISTRATOR";
        default:
            return "error";
    }
}