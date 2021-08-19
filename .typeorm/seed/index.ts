import { main } from "./functions/main.function";

main()
    .then(() => {
        console.log("Done.");
    })
    .catch(error => {
        console.error("Error seeding database:");
        console.error(error);
    });
