
module.exports.pagination_sort_search = (req, res, data) => {
    // DB error check
    if (data === "DBerror") {
        res.status(500).json({
            DBconnection: "somthing wrong, please check server's logs"
        });
        return;
    }

    const page = req.query.page;
    const rpp = req.query.rpp;
    const search = req.query.search;

    if (search) {
        const searchStr = req.query.key;
        const newSearchData = data.filter((ele, index) => {
            let concatStr = "";
            for (let key in ele) {
                if (key === "name" || key === "sex" || key === "rank" || key === "start_date" || key === "phone" || key === "email") {
                    concatStr += ele[key];
                }
            }
            return concatStr.replace(/\s/g, "").toUpperCase().includes(searchStr.trim().replace(/\s/g, "").toUpperCase());
        });
        res.status(200).json(newSearchData);
        return;
    }
    
    newData = data.slice(page * rpp, page * rpp + rpp);
    res.status(200).json(newData);
}