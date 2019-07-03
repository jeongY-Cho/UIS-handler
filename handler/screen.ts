export type Coordinates = [number, number];

export default class EmulatorScreen {
  screenArr: string[] = [];
  screenString: string = "";

  set = (screenArr: string[]) => {
    for (let line of screenArr) {
      this.screenArr.push(line);
    }
    this.screenString = this.screenArr.join(" ");
  };

  get = () => {
    return this.screenArr;
  };

  clear = () => {
    this.screenArr = [];
    this.screenString = "";
  };

  includes = (query: string) => {
    return this.screenString.includes(query);
  };

  indexOf = (
    query: string,
    fromRow?: number,
    fromColumn?: number
  ): Coordinates => {
    for (let i = fromRow || 0; i < this.screenArr.length; i++) {
      let j = this.screenArr[i].indexOf(query, fromColumn);
      if (j > -1) {
        return [i, j];
      }
    }
    return [-1, -1];
  };

  findAll = (query: string, fromRow?: number, fromColumn?: number) => {
    // call indexof function repeatedly till returns [-1,-1]
    // at each call adds one to returned column index and calls
  };

  WordAt(row: number, column: number, customBreak: string): string;
  WordAt(coords: Coordinates, customBreak: string): string;
  WordAt(
    rowOrCoords: number | Coordinates,
    columnOrCustomBreak?: number | string,
    customWordBreak?: string
  ): string {
    let startCoords: Coordinates;
    let wordBreak: string = " ";

    if (
      typeof rowOrCoords === "number" &&
      typeof columnOrCustomBreak === "number"
    ) {
      startCoords = [rowOrCoords, columnOrCustomBreak];
      if (customWordBreak) {
        wordBreak = customWordBreak;
      }
    } else if (Array.isArray(rowOrCoords)) {
      startCoords = rowOrCoords;
      if (typeof columnOrCustomBreak === "string") {
        wordBreak = columnOrCustomBreak;
      }
    } else {
      throw new Error("improper arguments");
    }

    // start at supplied indexes
    // iterates forward not back from index
    // iterate row till space, EOL or custom

    let word: string = "";
    for (let i = startCoords[1]; i < this.screenArr.length; i++) {
      let char = this.screenArr[startCoords[0]][i];
      if (char === wordBreak) {
        return word;
      } else {
        word += char;
      }
    }
    return word;
  }
}
