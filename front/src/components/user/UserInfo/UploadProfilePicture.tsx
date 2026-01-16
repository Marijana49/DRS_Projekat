import { useState } from "react";
import type { IUserAPIService } from "../../../api/user/IUserAPIService";
import { ProcitajPoKljucu } from "../../../helpers/local_storage";

interface ChangePictureProps {
    userApi: IUserAPIService
}

export const ChangeProfilePicture = ({userApi} : ChangePictureProps) =>{
    const [picture, setPicture] = useState("");
    const [pictureFile, setPictureFile]= useState<File | null>(null);
    const [picturePreview, setPicturePreview] = useState("");
    const [error, setError] = useState("");


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]){
            const file = e.target.files[0];
            setPictureFile(file);
            
            const previewUrl = URL.createObjectURL(file);
            setPicturePreview(previewUrl);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const image = new Image();
                image.src = reader.result as string;

                image.onload = () => {
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");
                    if(!context)return;

                    context.drawImage(image, 0, 0,)
                    const compress = canvas.toDataURL("image/png", 0.5);
                    setPicture(compress);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = ProcitajPoKljucu("authToken");
        if(!token)return null;
        if(pictureFile != null){
            const formData = new FormData;
            formData.append("image", pictureFile);
            const answer = await userApi.uploadPicture(token, formData);
            if(!answer)
                setError(answer);
        }
    };
    return (<div className="container px-4 mx-auto">
                <div className="max-w-lg mx-auto">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl md:text-4xl font-extrabold">Update Information</h2>
                    </div>
                <form onSubmit={submitForm} encType="multipart/form-data">
        
                    <div className="mb-6">
                        <label className="block mb-2 font-extrabold">Street Number</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/"
                            onChange={handleImageChange}
                            className="inline-block mb-6 w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                            />
                        {pictureFile ? (<img src={picturePreview} />)
                        :(picture ? (<img src={picture}
                            onError={(e) => {e.currentTarget.src = "/default_icon.jpg"}} 
                        />):(null))}
                    </div>
                    <div className="flex flex-wrap -mx-4 mb-6 items-center justify-between">
                    <div className="w-full lg:w-auto px-4 mb-4 lg:mb-0">
                        {error && <p className="font-extrabold text-rose-700">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="inline-block w-full py-4 px-6 mb-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-800 hover:bg-indigo-900 border-3 border-indigo-900 shadow rounded transition duration-500">
                        Save
                    </button>
                </div>
                </form>
                </div>
            </div> 
    );   
};