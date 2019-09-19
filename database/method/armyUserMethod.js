'use strict';

const mongoose = require("mongoose");
const ArmyUsers = require("../schema/armyUserSchema");
const paginationAlgo = require("./pagination_sort_search");

/* GET ALL USERS AND RETURN AS AN ARRAY */
module.exports.getArrayOfAllArmyUser = (req, res) => {

    console.log("Start to fetch all users' data transaction... \n");

    ArmyUsers.find({}, (err, data) => {
        if (err) {
            console.error(err);
            return "DBerror";
        }
        console.log("DB *FIND ALL* transaction has succeed... \n");
        console.log("return data to caller successfully... \n");
        paginationAlgo.pagination_sort_search(req, res, data);
    });

}

/* GET ALL USERS */
module.exports.getAllArmyUser = (res) => {

    console.log("Start to fetch all users' data transaction... \n");

    // Find all users from Users collection
    ArmyUsers.find({}, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                DBconnection: `${err}`
            });
            return;
        }
        res.status(200).json(data);
        console.log("DB *FIND ALL* transaction has succeed... \n");
        console.log("Send data to client successfully... \n");
    });
};

/* GET NO CIRCLE SUPERIOR LIST FOR EDIT BASED ON REQUEST USER-ID 
   Work-flow:
             1. fetch all USERs back to server memeory
             2. find the target node by given id
             3. user BFS/DFS to find all target node's (as root) children 
             4. put those children to a list 
             5. filter out those data from all USERs data
             6. send valid list back to client
*/
module.exports.getValidSuperiorById = (res, id) => {

    console.log("Start to fetch all users' data transaction...\n");

    // Fina all users from Users collection
    ArmyUsers.find({}, (err, data) => {
        if (err) {
            closeFailHandle(err, res);
            return
        }
        console.log("Successfully get all users' data, start to follow the work-flow...\n");

        const validData = getAllValidSuperiorList(id, data);
        res.status(200).json(validData);
        console.log("DB *FIND ALL* transaction has succeed, DFS *FIND VALID SUPERIOR* transaction has succeed... \n");
        console.log("Send data to client successfully... \n");
    });
}

/* GET USER BY ID (NOTICE: IT IS FOR SUPERIORVIEW) */
module.exports.getArmyUserByID = (res, id) => {

    console.log(`Start to fetch user: ${id} data transaction... \n`);

    // Find one user by ID, ID was sent from client
    ArmyUsers.findById(id, (err, data) => {
        if (err) {
            console.error(err);
            res.status(400).json({
                DBconnection: `${err}`
            });
            return;
        } else if (data === null) {
            console.error(`user: ${id} is not found in database`);
            res.status(400).json({
                DBconnection: `User: ${id} is not Found in Database`
            });
            return;
        }
        res.status(200).json(data);
        console.log("DB *GET SUPERIOR VIEW* transaction has succeed... \n");
        console.log("Send data to client successfully... \n");
    });
};

/* GET USER'S NUM_OF_DS DATA LIST IN DETAILS 
   Work-flow: 
             1. find user's num_of_ds by req id 
             2. use ids in num_of_ds to find all ids detail data
*/
module.exports.getArmyDS = (res, id) => {

    console.log(`Start to fetch user: ${id} data transaction... \n`);

    // step 1
    ArmyUsers.findById(id, (err, data) => {
        if (err) {
            closeFailHandle(err, res);
            return;
        }

        // step 2
        const childrenIds = data.num_of_ds.map((ele, index) => {
            return ele._id;
        });
        ArmyUsers.find({ _id: { $in: childrenIds } }, (err, data) => {
            if (err) {
                closeFailHandle(err, res);
                return;
            }
            res.status(200).json(data);
            console.log("DB *GET SUBORDINATE VIEW* transaction has succeed... \n");
            console.log("Send data to client successfully... \n");
        });
    });

}

/* POST A NEW USER 
   Wokr-flow: 1. check data validation
              2. post new user based on res body
              3. update superior num_of_ds array 
*/
module.exports.insertArmyUser = (res, data) => {

    console.log("Start to check user data validation... \n");

    if (data === null || data === undefined || Object.keys(data).length < 5) {
        console.error("Invalid user data... \n");
        res.status(400).json({
            InvaildPost: `post data: ${data}`
        });
        return;
    }

    console.log("Request data is valid... \n");

    console.log("Start to create new document... \n");

    // insert new document to Users collection
    const newUserid = new mongoose.Types.ObjectId;
    const newArmyUser = new ArmyUsers({
        _id: newUserid,
        avatar_img: data.avatar_img,
        name: data.name,
        sex: data.sex,
        rank: data.rank,
        start_date: data.start_date,
        phone: data.phone,
        email: data.email,
        superior: data.superior,
        num_of_ds: []
    });

    console.log("New user has been created, save to DB now... \n");

    newArmyUser.save((err) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                DBconnection: `${err}`
            });
            return;
        }

        if (data.superior.name === null && data.superior._id === null) {
            console.log("New user has been saved, send 200 to client... \n");
            res.status(200).json({
                Message: "Insert New User Successfully"
            });
            console.log("DB *INSERT NEW USER* transaction has succeed... \n");
            console.log("Send message to client successfully... \n");
        } else {
            console.log("New user has been saved, update superior relations now... \n");
            ArmyUsers.findByIdAndUpdate(data.superior._id, { $push: { num_of_ds: { _id: newUserid } } }, { useFindAndModify: false }, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        DBconnection: `${err}`
                    });
                    return
                }
                res.status(200).json({
                    Message: "Insert New User Successfully"
                });
                console.log("DB *INSERT NEW USER* transaction has succeed... \n");
                console.log("Send message to client successfully... \n");
            })
        }
    });
}

/* PUT/UPDATE A USER BY USERID 
   Work-flow:
             case 1: user update data's superior stay the same
                ----> just update other fileds of user based on request data

             case 2: user update data's superior has changed 
                case 2.1 user's original parent node is null
                    ----> 2.1.1 insert user to other's num_of_DS
                    ----> 2.1.2 update user's superior
                
                case 2.2 user's original parent node is NOT null
                    ----> 2.2.1 delete user from original superior's num_of_DS
                    ----> 2.2.2 insert user to other's num_of_DS
                    ----> 2.2.3 update user's superior
                    
*/
module.exports.updateArmyUser = (res, id, data) => {

    console.log(`Start to update user: ${id} transaction... \n`);

    console.log("Start to retrieve user's original data... \n");

    ArmyUsers.findById(id, (err, originalData) => {
        if (err) {
            closeFailHandle(err, res);
            return;
        }
        console.log("Orginal Data has retrieve back...Start to decide the updae work-flow...\n");

        const originName = originalData.superior.name ? originalData.superior.name.toString() : null;
        const originId = originalData.superior._id ? originalData.superior._id.toString() : null;

        // case 1
        if ((originName === data.superior.name && originId === data.superior._id)) {

            console.log("Case 1 Enter: user update data's superior STAY THE SAME...\n");

            ArmyUsers.findByIdAndUpdate(id, data, { useFindAndModify: false }, (err) => {
                if (err) {
                    closeFailHandle(err, res);
                    return;
                }
                res.status(200).json({
                    Message: `Update User: ${id} Successfully`
                });
                console.log("DB *UPDATE USER* transaction has succeed... \n");
                console.log("Send message to client successfully \n");
            });

            // case 2
        } else {
            console.log("Case 2 Enter: user update data's superior HAVE CHANGED...\n");

            if (originalData.superior.name === null && originalData.superior._id === null) {
                // case 2.1

                console.log("Case 2.1 Enter: user update data's superior HAVE CHANGED, and, orginal user has NO parent...\n");

                ArmyUsers.findByIdAndUpdate(data.superior._id, { $push: { num_of_ds: { _id: id } } }, { useFindAndModify: false }, (err) => {
                    if (err) {
                        closeFailHandle(err, res);
                        return;
                    }

                    ArmyUsers.findByIdAndUpdate(id, data, { useFindAndModify: false }, (err) => {
                        if (err) {
                            closeFailHandle(err, res);
                            return;
                        }
                        res.status(200).json({
                            Message: `Update User: ${id} Successfully`
                        });
                        console.log("DB *UPDATE USER* transaction has succeed... \n");
                        console.log("Send message to client successfully \n");
                    });
                });

                // case 2.2
            } else {

                console.log("Case 2.2 Enter: user update data's superior HAVE CHANGED, and, orginal user has a parent...\n");

                ArmyUsers.updateOne({ _id: originalData.superior._id }, { $pull: { num_of_ds: { _id: id } } }, (err) => {
                    if (err) {
                        closeFailHandle(err, res);
                        return;
                    }

                    ArmyUsers.findByIdAndUpdate(data.superior._id, { $push: { num_of_ds: { _id: id } } }, { useFindAndModify: false }, (err) => {
                        if (err) {
                            closeFailHandle(err, res);
                            return;
                        }

                        ArmyUsers.findByIdAndUpdate(id, data, { useFindAndModify: false }, (err) => {
                            if (err) {
                                closeFailHandle(err, res);
                                return;
                            }
                            res.status(200).json({
                                Message: `Update User: ${id} Successfully`
                            });
                            console.log("DB *UPDATE USER* transaction has succeed... \n");
                            console.log("Send message to client successfully \n");
                        });
                    });
                });
            }
        }
    })
}

/* DELETE USER BY USERID 
   Wokr-flow:
             case 1: user is parent node (user.superior.name === null && user.superior._id === null)
                case 1.1 user has no children (user.num_of_ds.length === 0) ----> just delete
                case 1.2 user has multiple children (user.num_of_ds.length > 0) ----> loop through children, set they superior to null, then delete user

            case 2: user is internal node (user.superior.name && user.superior._id && user.num_of_ds.length > 0)
                ----> 2.1 loop through children
                      2.2 set they superior to user's superior
                      2.3 push they to user's superior num_of_ds
                      2.4 delete user from user's superior num_of_ds
                      2.5 delete user 
            
            case 3: user is leave node (user.superior.name && user.superior._id && user.num_of_ds.length === 0)
                ----> 3.1 delete user from user's superior num_of_ds
                      3.2 delete user
*/
module.exports.deleteArmyUser = (res, data) => {

    console.log(`Start to decide delete user work-flow... \n`);

    // Case 1
    if (data.superior.name === null && data.superior._id === null) {
        console.log("Case 1 Enter: user is parent node\n");
        if (data.num_of_ds.length === 0) {
            console.log("Case 1.1 Enter: user is parent node, has no children\n");
            ArmyUsers.findByIdAndDelete(data._id, (err) => {
                if (err) {
                    closeFailHandle(err, res);
                    return;
                }
                closeSuccessHandle(res, data._id);
            });
        } else {
            // update user's children superior to null
            console.log("Case 1.2 Enter: user is parent node, has multiple children\n");
            const childrenIds = data.num_of_ds.map((ele, index) => {
                return ele._id;
            })
            ArmyUsers.updateMany({ _id: { $in: childrenIds } }, { $set: { superior: { name: null, _id: null } } }, (err) => {
                if (err) {
                    closeFailHandle(err, res);
                    return;
                }
                // delete user safely
                ArmyUsers.findByIdAndDelete(data._id, (err) => {
                    if (err) {
                        closeFailHandle(err, res);
                        return;
                    }
                    closeSuccessHandle(res, data._id);
                });
            });
        }
    }

    // Case 2
    else if (data.superior.name && data.superior._id && data.num_of_ds.length > 0) {
        console.log("Case 2 Enter: user is internal node\n");
        const childrenIds = data.num_of_ds.map((ele, index) => {
            return ele._id;
        });
        ArmyUsers.updateMany({ _id: { $in: childrenIds } }, { $set: { superior: { name: data.superior.name, _id: data.superior._id } } }, (err) => {
            if (err) {
                closeFailHandle(err, res);
                return;
            }
            ArmyUsers.updateOne({ _id: data.superior._id }, { $push: { num_of_ds: { $each: data.num_of_ds } } }, (err) => {
                if (err) {
                    closeFailHandle(err, res);
                    return;
                }
                ArmyUsers.updateOne({ _id: data.superior._id }, { $pull: { num_of_ds: { _id: data._id } } }, (err) => {
                    if (err) {
                        closeFailHandle(err, res);
                        return
                    }
                    // delete user safely
                    ArmyUsers.findByIdAndDelete(data._id, (err) => {
                        if (err) {
                            closeFailHandle(err, res);
                            return;
                        }
                        closeSuccessHandle(res, data._id);
                    });
                });
            });
        });
    }

    // Case 3
    else if (data.superior.name && data.superior._id && data.num_of_ds.length === 0) {
        console.log("Case 3 Enter: user is leave node\n");
        ArmyUsers.updateOne({ _id: data.superior._id }, { $pull: { num_of_ds: { _id: data._id } } }, (err) => {
            if (err) {
                closeFailHandle(err, res);
                return;
            }
            // delete user safely
            ArmyUsers.findByIdAndDelete(data._id, (err) => {
                if (err) {
                    closeFailHandle(err, res);
                    return;
                }
                closeSuccessHandle(res, data._id);
            });
        });
    }

    else {
        console.log("Case Default Enter: ???\n");
        console.error("Something wrong, please check log...\n");
        res.status(500).json({
            DBconnection: "Something wrong, please check server"
        });
    }
}

const closeFailHandle = (err, res) => {
    console.error(err);
    res.status(500).json({
        DBconnection: `${err}`
    });
}

const closeSuccessHandle = (res, id) => {
    res.status(200).json({
        Message: `Delete User: ${id} Successfully`
    });
    console.log("DB *DELETE USER* transaction has succeed... \n");
    console.log("Send message to client successfully... \n");
}

const getAllValidSuperiorList = (id, data) => {
    // for efficience purpose, transfer data list to map first
    // Map: (Key: _ID, Value: list of DC_ID)
    const map = new Map();
    data.forEach((ele) => {
        console.log(typeof ele.num_of_ds, ele.num_of_ds);
        map.set(ele._id.toString(), ele.num_of_ds.map((e, index) => e._id.toString()));
    })
    const set = new Set();

    // fill out set with all children of current entry id node, including itself 
    dfsHelper(id, map, set);

    // filter out any one in the set from data based on id
    return data.filter((ele, index) => !set.has(ele._id.toString()));
}

const dfsHelper = (id, map, set) => {
    // add to set 
    set.add(id)
    let currentChildrenArray = map.get(id);

    // base case
    if (currentChildrenArray === []) {
        return;
    }

    // recursive rule
    for (let i = 0; i < currentChildrenArray.length; i++) {
        dfsHelper(currentChildrenArray[i], map, set);
    }
}
