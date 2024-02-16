import { LocalStorage } from "@raycast/api";
import { XcodeProjectInfo } from "./model";

export interface CounterInfo {
  filePath: string;
  counter: number;
}
/**
 * XcodeProjectOpenCounter
 */
export class XcodeProjectOpenCounter {
  /**
   * The LocalStorage Key
   */
  private static localStorageKey = "xcode-project-counter";

  /**
   * Retrieve favorites Xcode Project file paths
   */
  static async counters(): Promise<CounterInfo[]> {
    const favoritesItem: string | undefined = await LocalStorage.getItem(XcodeProjectOpenCounter.localStorageKey);
    let listProject: CounterInfo[] = [];
    if (favoritesItem) {
      listProject = JSON.parse(favoritesItem);

      // let idx = 0;
      // listProject.forEach((element:CounterInfo) => {
      // 	console.log(idx+":"+element.filePath + "||||||"+element.counter);
      // 	idx+=1;
      // });
    }
    return listProject;
  }

  /**
   * Add Xcode Project to favorites
   * @param project The XcodeProject that should be added to favorites
   */
  static async addCounter(project: XcodeProjectInfo) {
    const favorites = await XcodeProjectOpenCounter.counters();
    //   favorites.map((e)=>{
    // 	console.log("EEEEE: "+e.filePath);
    // 	if (e.filePath === project.path) {
    // 		console.log("EEEEE222222: "+e.filePath);
    // 	}
    //   });
    let counter = favorites.find((e) => e.filePath === project.path);
    //   console.log("FOUND: "+counter?.counter + "|"+project.path);
    if (counter != undefined) {
      //add plus 1
      counter.counter += 1;
    } else {
      counter = {
        counter: 1,
        filePath: project.path,
      };
    }
    favorites.push(counter);
    await XcodeProjectOpenCounter.saveCounter(favorites);
  }

  /**
   * Remove Xcode Project from favorites
   * @param project The XcodeProject that should be removed from favorites
   */
  // static async removeFromFavorites(project: XcodeProjectInfo) {
  //   let favorites = await XcodeProjectFavoriteService.favorites();
  //   favorites = favorites.filter((favorite) => favorite !== project.path);
  //   await XcodeProjectFavoriteService.saveFavorites(favorites);
  // }

  /**
   * Save favorite Xcode Project file paths
   * @param favorites The Xcode Project file paths that should be saved
   */
  private static async saveCounter(favorites: CounterInfo[]) {
    await LocalStorage.setItem(XcodeProjectOpenCounter.localStorageKey, JSON.stringify(favorites));
  }
}
