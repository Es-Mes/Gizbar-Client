const useGetFilePath = () =>{

    const getFilePath = (img) =>{
        if(img){
            return "http://slika/" + img
        }else{
            return "/SlikaLogo.ico"
        }
    }

    return {getFilePath}

}
export default useGetFilePath