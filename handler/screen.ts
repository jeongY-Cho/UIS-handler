export type Coordinates = [number, number];

export default class EmulatorScreen {
  history: string[][] = []
  screenArr: string[] = [];
  screenString: string = "";

  set = (screenArr: string[]) => {
    if (this.screenArr.length) {
      this.clear()
    }

    this.screenArr = screenArr
    this.screenString = this.screenArr.join("\n");
  };

  get = () => {
    return this.screenArr;
  };

  clear = () => {

    this.pushToHistory(this.screenArr)
    this.screenArr = [];

    this.screenString = "";
  };


  private pushToHistory = (screen: string[]) => {
    if (this.history.length === 100) {
      this.history.shift()
    }
    this.history.push(screen)
  }

  includes = (query: string) => {
    return this.screenString.toLowerCase().includes(query.toLowerCase());
  };

  indexOf = (
    query: string,
    fromRow?: number,
    fromColumn?: number
  ): Coordinates => {
    for (let i = fromRow || 0; i < this.screenArr.length; i++) {
      if (fromRow && i === fromRow + 1) {
        fromColumn = 0
      } else if (!fromRow && i === 1) {
        fromColumn = 0
      }
      let j = this.screenArr[i].toLowerCase().indexOf(query.toLowerCase(), fromColumn);

      if (j > -1) {

        return [i, j];
      }
    }
    return [-1, -1];
  };

  findAll = (query: string, fromRow?: number, fromColumn?: number): Coordinates[] => {
    // call indexof function repeatedly till returns [-1,-1]
    // at each call adds one to returned column index and calls
    let finds: Coordinates[] = []
    let startRow = fromRow || 0
    let startColumn = fromColumn || 0


    while (true) {
      let coords = this.indexOf(query, startRow, startColumn)
      if (coords[0] === -1 && coords[1] === -1) {
        return finds
      } else {
        finds.push(coords)
        startRow = coords[0]
        startColumn = coords[1] + 1
      }

    }

  };

  wordAt(row: number, column: number, customBreak?: string): string;
  wordAt(coords: Coordinates, customBreak?: string): string;
  wordAt(
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

    let line = this.screenArr[startCoords[0]]
    for (let i = startCoords[1]; i < line.length; i++) {
      let char = line[i];
      if (char === wordBreak) {
        return word;
      } else {
        word += char;
      }
    }
    return word;
  }

  parse = (customBreak?: string | RegExp): { words: string[], map: Coordinates[] } => {
    if (customBreak) {
      let replaced: string[] = this.screenString.split(customBreak)
    }
    let replaced: string[] = this.screenString.split(/ |\n/).filter((elem) => elem)

    let map: Coordinates[] = []
    let startCoord: Coordinates = [0, 0]
    for (let word of replaced) {
      let returnCoord = this.indexOf(word, ...startCoord)
      map.push(returnCoord)

      startCoord = [returnCoord[0], returnCoord[1] + 1]
    }

    return {
      words: replaced,
      map
    }
  }
}
