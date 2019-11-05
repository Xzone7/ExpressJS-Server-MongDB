const a = [1, 2]
const b = [3, 4]

for (let i = 0; i < 4; i++) {
    setTimeout((i) => {
        console.log(i)
    }, 1000);
}