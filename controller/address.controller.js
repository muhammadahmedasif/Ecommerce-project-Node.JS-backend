import AddressModel from '../models/address.model.js';

export async function addaddress(req, res) {
  try {
    const userid = req.userId;
    const { address, pincode, city, country, mobile, status, state} = req.body;

    const addaddress = new AddressModel({
      user_id: userid,
      address,
      pincode,
      city,
      country,
      mobile,
      status, 
      state
    });

    await addaddress.save();

    return res.status(200).json({
      message: "Address Added",
      error: false,
      success: true,
      data: addaddress,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


export async function deleteaddress(req, res) {

    try {

        const userid = req.userId;
        const addressid = req.params.id;

        const address = await AddressModel.find({
            user_id: userid,
            addressid_id: addressid
        })

        if(!address){
            return res.status(404).json({
                message:"No address added yet",
                error: true,
                success: false
            })
        }

         const deletedaddress = await AddressModel.deleteOne({
            user_id: userid,
            address_id: productid
        })

         return res.status(200).json({
                message:"Address Deleted",
                address: deletedaddress,
                error: false,
                success: true
            })
        
    } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
    
}


export async function getalladdresses(req, res) {

    try {

        const userid = req.userId;

        const address = await AddressModel.find({
            user_id: userid,
        }).populate("user_id")

        if(!address){
            return res.status(404).json({
                message:"No Address Found",
                error: true,
                success: false
            })
        }

         return res.status(200).json({
                message:"Address Details:",
                address: address,
                error: false,
                success: true
            })
        
    } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
    
}