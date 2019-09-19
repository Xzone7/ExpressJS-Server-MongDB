
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
    const sort = req.query.sort;

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

    if (sort) {
        // sort = 'asc' || 'desc', sortKey = 0, 1, 2, 3
        const sortId = req.query.sortkey;
        const sortMap = ["name", "sex", "rank", "start_date"];
        const sortedProp = sortMap[sortId];
        const rankMap = new Map();
        rankMap.set("Private", 0);
        rankMap.set("Specialist", 1);
        rankMap.set("Corporal", 2);
        rankMap.set("Sergeant", 3);
        rankMap.set("Warrant Officer", 4);
        rankMap.set("Lieutenant", 5);
        rankMap.set("Captain", 6);
        rankMap.set("Major", 7);
        rankMap.set("Colonel", 8);
        rankMap.set("General", 9);

        if (sort === "asc") {
            switch (sortedProp) {
                case "name":
                    data.sort((a, b) => {
                        if (a[sortedProp].replace(/\s/g, "") > b[sortedProp].replace(/\s/g, "")) {
                            return 1;
                        } else if (a[sortedProp].replace(/\s/g, "") < b[sortedProp].replace(/\s/g, "")) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                    break;

                case "sex":
                    data.sort((a, b) => {
                        if (a[sortedProp] > b[sortedProp]) {
                            return 1;
                        } else if (a[sortedProp] < b[sortedProp]) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                    break;

                case "rank":
                        data.sort((a, b) => {
                            return rankMap.get(a[sortedProp]) - rankMap.get(b[sortedProp]);
                        });
                        break;

                default:
                        data.sort((a, b) => {
                            return new Date(a[sortedProp]).getTime() - new Date(b[sortedProp]).getTime();
                        });
                        break;
            }
        } else {
            // sort === "desc"
            switch (sortedProp) {
                case "name":
                    data.sort((a, b) => {
                        if (a[sortedProp].replace(/\s/g, "") < b[sortedProp].replace(/\s/g, "")) {
                            return 1;
                        } else if (a[sortedProp].replace(/\s/g, "") > b[sortedProp].replace(/\s/g, "")) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                    break;

                case "sex":
                    data.sort((a, b) => {
                        if (a[sortedProp] < b[sortedProp]) {
                            return 1;
                        } else if (a[sortedProp] > b[sortedProp]) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                    break;

                case "rank":
                        data.sort((a, b) => {
                            return rankMap.get(b[sortedProp]) - rankMap.get(a[sortedProp]);
                        });
                        break;

                default:
                        data.sort((a, b) => {
                            return new Date(b[sortedProp]).getTime() - new Date(a[sortedProp]).getTime();
                        });
                        break;
            }
        }
        res.status(200).json(data);
        return;
    }

    newData = data.slice(page * rpp, page * rpp + rpp);
    res.status(200).json(newData);
}