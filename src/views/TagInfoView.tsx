import type { TagInfo } from "@/lib/connection-config-file";
import type { ConnectionModel } from "@/models/connection";
import { EditableText, H1 } from "@blueprintjs/core";
import { runInAction } from "mobx";
import { observer } from "mobx-react";

interface TagInfoViewProps {
    tagId: string;
    connection: ConnectionModel;
}

export const TagInfoView = observer((props: TagInfoViewProps) => {
    const { tagId, connection } = props;

    const entry = connection.config.tags.find((t) => t.id === tagId);

    if (!entry) {
        return (
            <div>
                <H1>Tag not found</H1>
            </div>
        );
    }

    return <TagInfoEntryView entry={entry} connection={connection} />;
});

interface TagInfoEntryViewProps {
    entry: TagInfo;
    connection: ConnectionModel;
}

export const TagInfoEntryView = observer((props: TagInfoEntryViewProps) => {
    const { entry } = props;

    const name = entry.name;

    return (
        <div>
            <H1>
                <EditableText
                    value={name}
                    onChange={(name) => {
                        runInAction(() => {
                            entry.name = name;
                        });
                    }}
                />
            </H1>
            Tag:
        </div>
    );
});
