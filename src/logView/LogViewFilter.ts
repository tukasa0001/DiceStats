export const EMPTY_FILTER: LogViewFilter = {
    hiddenMessageTypes: [],
    hiddenCharacters: [],
    searchText: ""
}

type LogViewFilter = {
    hiddenMessageTypes: readonly string[]
    hiddenCharacters: readonly string[]
    searchText: string
}

export default LogViewFilter;