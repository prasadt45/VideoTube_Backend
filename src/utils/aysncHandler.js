const aysncHandler =(requestHandler)=>{
    (req , res , next)=>{
        Promise.resolve(requestHandler(req ,res , next))
        .catch((err)=>next(err))
    }
    
    
}

export {aysncHandler}


// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}
/**** ABOVE AND BELOW SYNATX DOES THE SAME WORK **** */
//  WRAPPER FUNCTION USING TRY CATCH BLOACK 
// const aysncHandler = (fn)=>async (req , res , next)=>{
//     try {
//         await fn(req , res , next);

        
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success : false ,
//             message : error.message
//         })
        
//     }
// }