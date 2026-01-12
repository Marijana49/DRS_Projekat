function SacuvajPoKljucu(key: string, value: string): boolean {
    try {
        localStorage.setItem(key, value);
        return true;
    }
    catch(error){
        console.error(key, error);
        return false;
    }
}

function ProcitajPoKljucu(key: string): string | null {
    try{
        return localStorage.getItem(key);
    }catch(error){
        console.error(key, error);
        return null;
    }
}

function ObrisiPoKljucu(key: string): boolean{
    try{
        localStorage.removeItem(key);
        return true;
    }catch (error){
        console.error(key, error);
        return false;
    }
}

export { SacuvajPoKljucu, ProcitajPoKljucu, ObrisiPoKljucu};