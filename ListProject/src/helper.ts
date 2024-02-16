import { useExec } from "@raycast/utils";
import { XcodeProjectInfo, ProjectType } from "./model"
import { CounterInfo } from "./XcodeProjectOpenCounter";

export class Helper {
	static brewPath = "/Users/nganphanthanh/.pyenv/shims/python3"
	static app = "/Users/nganphanthanh/Documents/TOOLS/RayCast/ScriptCommand/pyUtil/searchFile.py"
	static folderPath = "/Users/nganphanthanh/Documents/REPOSITORY";

	static async xcodeProjects(data:string, counters: CounterInfo[]): Promise<XcodeProjectInfo[]> {
  		var listProject = JSON.parse(data || "{}");
		let xcodeProjects = Helper.parseProject(listProject);

		//let sort
		if (counters.length > 0) {
			xcodeProjects.map((x) => {
				const count = counters.find((c) => c.filePath == x.path);
				if (count != undefined) {
					x.openCount = count.counter;
				}
			});
		}

		return Helper.sortProject(xcodeProjects);
	}

	private static parseProject(listProject: any) {
		let fruits: Array<XcodeProjectInfo> = []

		listProject.forEach((element: any) => {
			let fileNameOnly = Helper.fileName(element.path);

			let item: XcodeProjectInfo = {
				title: Helper.fileWithoutExt(fileNameOnly),
				path: element.path,
				id: element.id,
				projectType: Helper.fileExt(fileNameOnly) == ".xcodeproj" ? ProjectType.XCODEPROJ : ProjectType.XCWORKSPACE,
				tag: element.tag,
				openCount: 0,
			};

			fruits.push(item);

		});

		return fruits;
	}

	private static sortProject(listProject: XcodeProjectInfo[]) {

		return listProject.sort((n1: XcodeProjectInfo, n2: XcodeProjectInfo) => {
			//sort reverse DESC
			if (n1.openCount > n2.openCount) return -1;
			if (n1.openCount < n2.openCount) return 1;

			if (n1.tag === "") {
				return 1; // empty string "a" should appear after non-empty string "b"
			} else if (n2.tag === "") {
				return -1; // empty string "b" should appear after non-empty string "a"
			}

			if (n1.tag > n2.tag) return 1;
			if (n1.tag < n2.tag) return -1;

			if (n1.title.toLocaleLowerCase() > n2.title.toLocaleLowerCase()) {
				return 1;
			}

			if (n1.title.toLocaleLowerCase() < n2.title.toLocaleLowerCase()) {
				return -1;
			}

			return 0;
		});

	}

  static shortPath(path: string) {
    let last = path.lastIndexOf("/");
    if (last == -1) {
      return path;
    }
    let last2 = path.lastIndexOf("/", last - 1);
    if (last2 == -1) {
      return path;
    }

    return path.substring(last2 + 1);
  }

  static fileName(path: string) {
    let last = path.lastIndexOf("/");
    if (last == -1) {
      return path;
    }
    return path.substring(last + 1);
  }

  static fileWithoutExt(path: string) {
    let dot = path.lastIndexOf(".");
    if (dot == -1) {
      return path;
    }

    return path.substring(0, dot);
  }

  static fileExt(path: string) {
    let dot = path.lastIndexOf(".");
    if (dot == -1) {
      return path;
    }

    return path.substring(dot);
  }
}
