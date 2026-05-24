import words from "./words.js";

function getRandomWords(count = 3) {

   const shuffled = [...words]
      .sort(() => 0.5 - Math.random());

   return shuffled.slice(0, count);
}

export default getRandomWords;