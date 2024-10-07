import type { TagInfo } from "@/lib/connection-config-file";
import { MenuItem, Tag } from "@blueprintjs/core";
import { MultiSelect } from "@blueprintjs/select";
import { useMemo, useState } from "react";

interface TagMultiSelectProps {
    tags: TagInfo[];
    selectedTagIds: string[];
    onTagIdAdd: (tagId: string) => void;
    onTagIdRemove: (tagId: string) => void;
}

export const TagMultiSelect = (props: TagMultiSelectProps) => {
    const { tags, selectedTagIds, onTagIdAdd, onTagIdRemove } = props;

    const selectedTags = useMemo(() => {
        return tags.filter((tag) => selectedTagIds.includes(tag.id));
    }, [tags, selectedTagIds]);

    const [tagInput, setTagInput] = useState("");
    return (
        <MultiSelect<TagInfo>
            itemRenderer={(tag, tagProps) => <MenuItem text={tag.name} {...tagProps} />}
            query={tagInput}
            onQueryChange={(query) => setTagInput(query)}
            tagRenderer={(tag) => <Tag>{tag.name}</Tag>}
            itemPredicate={(query, item) => {
                return item.name.toLowerCase().includes(query.toLowerCase());
            }}
            items={tags}
            selectedItems={selectedTags}
            onItemSelect={(tag) => {
                onTagIdAdd(tag.id);
                setTagInput("");
            }}
            onRemove={(tag) => {
                onTagIdRemove(tag.id);
                setTagInput("");
            }}
        />
    );
};
