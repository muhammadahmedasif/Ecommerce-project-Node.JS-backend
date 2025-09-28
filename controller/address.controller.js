import AddressModel from '../models/address.model.js';

export async function addaddress(req, res) {
  try {
    const userid = req.userId;
    const { address, pincode, city, country, mobile, status, state } = req.body;

    // ✅ Check if this is the user's first address
    const existingAddresses = await AddressModel.countDocuments({ user_id: userid });

    const addaddress = new AddressModel({
      user_id: userid,
      address,
      pincode,
      city,
      country,
      mobile,
      status,
      state,
      selected: existingAddresses === 0 ? true : false  // first one = true, rest = false
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

    // 1. Delete the given address
    const deletedAddress = await AddressModel.findOneAndDelete({
      user_id: userid,
      _id: addressid,
    });

    if (!deletedAddress) {
      return res.status(404).json({
        message: "No address found to delete",
        error: true,
        success: false,
      });
    }

    // 2. If the deleted one was selected → assign another as selected
    if (deletedAddress.selected === true) {
      // Find remaining addresses for this user
      const remainingAddresses = await AddressModel.find({ user_id: userid }).sort({ createdAt: 1 }); 
      // 👆 Sorting by createdAt ensures consistent order

      if (remainingAddresses.length > 0) {
        // Pick the "second one" (index 0 after deletion becomes "first", index 1 becomes "second")
        const toSelect = remainingAddresses[1] || remainingAddresses[0]; 
        // fallback to first if there's no second

        await AddressModel.updateOne(
          { _id: toSelect._id },
          { $set: { selected: true } }
        );
      }
    }

    return res.status(200).json({
      message: "Address Deleted",
      address: deletedAddress,
      error: false,
      success: true,
    });

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
    })

    if (!address) {
      return res.status(404).json({
        message: "No Address Found",
        error: true,
        success: false
      })
    }

    return res.status(200).json({
      message: "Address Details:",
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

export async function selectcurrentaddress(req, res) {
  try {
    const userid = req.userId;
    const addressid = req.params.id;

    // 1. Make sure user has addresses
    const hasAddresses = await AddressModel.exists({ user_id: userid });
    if (!hasAddresses) {
      return res.status(404).json({
        message: "No Address Found",
        error: true,
        success: false,
      });
    }

    // 2. First set all addresses of user to false
    await AddressModel.updateMany(
      { user_id: userid },
      { $set: { selected: false } }
    );

    // 3. Then set the requested one to true
    const updatedAddress = await AddressModel.findOneAndUpdate(
      {
        user_id: userid,
        _id: addressid,
      },
      { $set: { selected: true } },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        message: "Address not found for selection",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Address selected as current address",
      curraddress: updatedAddress,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

