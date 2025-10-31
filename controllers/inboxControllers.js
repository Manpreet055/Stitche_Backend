const { ObjectId } = require("mongodb");
const connectMongoDB = require("../config/connectMongoDB")

const handleGetAllMessages =async (req,res)=>{
  try{
    const Inbox = await connectMongoDB("inbox");
    
    const allMessages = await Inbox.find().toArray();
    
    res.status(200).json({
      status:1,
      msg:"Data fetched successfully ",
      messages:allMessages
    })
  } catch (error){
    res.status(500).json({
      status:0,
      msg:`Server Error : ${error.message}`,
      
    })
  }
}


const findChatById = async (req,res)=>{
  try{
    const {id} = req.params;
    if(!ObjectId.isValid(id)){
      res.status(400).json({
        status:0,
        msg:"Chat Id is not valid"
      })
    }
    
    const Inbox = await connectMongoDB("inbox")
    const foundChat = await Inbox.findOne({_id:new ObjectId(id)})
    
    if(!foundChat){
      res.status(404).json({
        status:0,
        msg:"Chat not found"
      })
    }
    res.status(200).json({
      status:1,
      msg:"Data fetching Successful",
      chat: foundChat
    })
  } catch (error){
    res.status(500).json({
      status:0,
      msg:`Server Error :${error.message}`
    })
  }
}
module.exports = {handleGetAllMessages,findChatById}