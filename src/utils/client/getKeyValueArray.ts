interface HasId {
    _id: string;
    isActive?: boolean;
}

interface HasIdForSlots {
    _id: string;
    isChecked?: boolean;  // Optional field
}


export const getFriendZoneKeyValueArray = <T extends HasId>(arr: T[]): { [key: string]: T } => {
    return arr.reduce((acc, item) => {
        acc[item._id] = { ...item, isActive: item.isActive ?? true };
        return acc;
    }, {} as { [key: string]: T });
};

export const getSlotsKeyValueArray = <T extends HasIdForSlots>(arr: T[]): { [key: string]: T } => {
    return arr.reduce((acc, item) => {
        // Set isChecked to false by default if not provided
        acc[item._id] = { ...item, isChecked: item.isChecked ?? false };
        return acc;
    }, {} as { [key: string]: T });
};