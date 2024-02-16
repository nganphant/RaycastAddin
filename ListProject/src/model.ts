

export enum ProjectType {
	XCODEPROJ,
	XCWORKSPACE
}

/**
 * A XcodeProject
 */
export interface XcodeProjectInfo {
	title: string;
	path: string;
	id: string;
	tag: string;
	projectType: ProjectType;
	openCount: number;
}