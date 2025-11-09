import { marshall } from "@aws-sdk/util-dynamodb";
import { Movie } from "./types";

export const generateMovieItem = (movie: Movie) => {
  return {
    PutRequest: {
      Item: marshall(movie),
    },
  };
};

export const generateBatch = (data: Movie[]) => {
  return data.map((e) => {
    return generateMovieItem(e);
  });
};

export const chunkArray = <T>(arr: T[], size: number): T[][] => {
    const chunkedArr: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunkedArr.push(arr.slice(i, i + size));
    }
    return chunkedArr;
};

