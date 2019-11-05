const addNum = (num) => {
    let rest = num;
    let res = []
    for (let i = 0; i < num; i++) {
        if (rest <= 0) {
            break;
        } else {
            res.push(num - i);
            rest = rest - i;
        }
    }
    return res;
}

console.log(addNum(6));