import { CoCSkillRollMessage } from './ccfoliaLog/message/CoCSkillRollMessage';
import { ParamChangeMessage } from './ccfoliaLog/message/ParamChangeMessage';
import { TalkMessage } from './ccfoliaLog/message/TalkMessasge';
import { SanityCheckMessage } from './ccfoliaLog/message/SanityCheckMessage';
import { JSX, useContext, useState } from 'react';
import { CcfoliaMessage } from './ccfoliaLog/message/CcfoliaMessage';
import { UnknownSecretDiceMessage } from './ccfoliaLog/message/UnknownSecretDiceMessage';
import { configCtx, setConfigCtx } from './App';
import { ErrorBlock, InfoBlock } from './Utils';
import { Box, Button, ContextMenu, Dialog, Flex, Select, Table, Heading, TextField } from '@radix-ui/themes';
import "./Stats.css"
import cocstats from './StatsCalculator/CoCStats';

class SkillStat {
    // 技能関連
    skillRollNum: number = 0;
    skillRollSum: number = 0;
    successNum: number = 0;
    failNum: number = 0;
    criticalNum: number = 0;
    spCriticalNum: number = 0;
    fumbleNum: number = 0;
    spFumbleNum: number = 0;
    skillRolls: Map<string, number> = new Map<string, number>();

    increment(msg: CoCSkillRollMessage) {
        this.skillRollNum++;
        this.skillRollSum += msg.diceValue;
        if (msg.isSuccess()) {
            this.successNum++;
            if (msg.isCritical()) {
                this.criticalNum++;
                if (msg.diceValue === 1) {
                    this.spCriticalNum++;
                }
            }
        }
        else {
            this.failNum++;
            if (msg.isFumble()) {
                this.fumbleNum++;
                if (msg.diceValue === 100) {
                    this.spFumbleNum++;
                }
            }
        }
        this.skillRolls.set(msg.skill, (this.skillRolls.get(msg.skill) ?? 0) + 1);
    }
}
class SanityCheckStat {
    // SANチェック
    checkNum: number = 0;
    successNum: number = 0;
    criticalNum: number = 0;
    fumbleNum: number = 0;
};
class StatusStat {
    // ステータス関連
    totalDamage: number = 0;
    minHealth: number | undefined = undefined;
    totalLostSAN: number = 0;
    minSAN: number | undefined = undefined;
}
class TalkStat {
    // 会話関連
    talkNum: number = 0;
    charNum: number = 0;
    pcTalkNum = 0;
    pcCharNum = 0;
};
class OtherStat {
    // その他
    secretDiceCount = 0;
}

type StatsProps = {
    logFile: CcfoliaMessage[]
}

const Stats = (props: StatsProps) => {
    const [skillFilter, setSkillFinter] = useState("none");

    const log = props.logFile;
    const config = useContext(configCtx);

    let startIdx = 0, endIdx = Infinity;
    // 開始・終了位置の判定
    if (config.startMessage !== "" || config.endMessage !== "") {
        let isStarted: boolean = config.startMessage === "";
        for (let i = 0; i < log.length; i++) {
            const msg = log[i];
            // 開始メッセージまで無視
            if (!isStarted && msg instanceof TalkMessage && config.startMessage === msg.text) {
                isStarted = true;
                startIdx = i;
            }
            // 終了メッセージが来たらbreak
            else if (config.endMessage !== "" && msg instanceof TalkMessage && config.endMessage === msg.text) {
                endIdx = i;
                break;
            }
        }
    }

    const jpnTextComparer = (a: readonly [string, any], b: readonly [string, any]) => a[0].localeCompare(b[0], "ja");

    const stats = cocstats.calc(log, {
        nameAliases: config.nameAliases,
        startIdx, endIdx
    });

    const skills = [...stats.perCharacter]
        .map(([name, stat]) => [name, stat.skillRoll] as const)
        .filter(([name, stat]) => 0 < stat.rollNum)
        .sort(jpnTextComparer)
    const filteredSkills = skillFilter === "none" ? [] : skills
        .map(([name, stat]) => [name, stat.perSkill.get(skillFilter)] as const)
        .filter(([name, stat]) => stat !== undefined && 0 < stat.rollNum)
        .map(([name, stat]) => [name, stat!] as const) // statがundefinedの項目は上のfilterで除去されている
    const status = [...stats.perCharacter]
        .map(([name, stat]) => [name, stat.status] as const)
        .filter(([name, stat]) => !isNaN(stat.minHealth) || !isNaN(stat.minSAN) || 0 < stat.totalDamage || 0 < stat.totalLostSAN)
        .sort(jpnTextComparer);
    const sanity = [...stats.perCharacter]
        .map(([name, stat]) => [name, stat.sanityCheck] as const)
        .filter(([name, stat]) => 0 < stat.rollNum)
        .sort(jpnTextComparer);
    const talks = [...stats.perCharacter]
        .map(([name, stat]) => [name, stat.talk] as const)
        .filter(([name, stat]) => 0 < stat.talkNum)
        .sort(jpnTextComparer);

    const avgFormatter = Intl.NumberFormat("ja-JP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const percentageFormatter = Intl.NumberFormat("ja-JP", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <Box my="2">
            {/*isStarted ? "" : <ErrorBlock>
                <>
                    開始メッセージが見つかりませんでした<br />
                    ログの最初からの統計を表示します
                </>
            </ErrorBlock>*/}
            <Heading my="4">技能振り統計</Heading>
            {0 < skills.length ?
                <StatTable characters={skills.map(tp => tp[0])} data={[
                    Data("技能振り回数", skills.map(tp => tp[1].rollNum)),
                    Data("平均出目", skills.map(tp => tp[1].rollNum == 0 ? "N/A" : avgFormatter.format(tp[1].valueSum / tp[1].rollNum))),
                    Data("一番振った技能", skills.map(([name, stat]) => {
                        if (stat.perSkill.size == 0) {
                            return "N/A";
                        }
                        let sorted = [...stat.perSkill]
                            .sort(([, stat1], [, stat2]) => stat2.rollNum - stat1.rollNum); // 技能振り数降順に並べ替え
                        return sorted
                            .filter(([, stat]) => stat.rollNum === sorted[0][1].rollNum) // 一番多く振った技能と同じ回数振った技能のみ残す
                            .map(([name,]) => name) // 技能名のみ残す
                            .join(", ") + ` (${sorted[0][1].rollNum}回)`; // 技能名を結合し、末尾に回数を付け加える
                    })),

                    Data("成功数", skills.map(tp => tp[1].successNum), { separate: true }),
                    Data("失敗数", skills.map(tp => tp[1].failNum)),
                    Data("クリティカル数", skills.map(tp => tp[1].criticalNum)),
                    Data("内1クリ", skills.map(tp => tp[1].spCriticalNum), { indent: true }),
                    Data("ファンブル数", skills.map(tp => tp[1].fumbleNum)),
                    Data("内100ファン", skills.map(tp => tp[1].spFumbleNum), { indent: true }),

                    Data("成功率", skills.map(tp => percentageFormatter.format(tp[1].successNum / tp[1].rollNum)), { separate: true }),
                    Data("失敗率", skills.map(tp => percentageFormatter.format(tp[1].failNum / tp[1].rollNum))),
                    Data("クリティカル率", skills.map(tp => percentageFormatter.format(tp[1].criticalNum / tp[1].rollNum))),
                    Data("内1クリ", skills.map(tp => percentageFormatter.format(tp[1].spCriticalNum / tp[1].rollNum)), { indent: true }),
                    Data("ファンブル率", skills.map(tp => percentageFormatter.format(tp[1].fumbleNum / tp[1].rollNum))),
                    Data("内100ファン", skills.map(tp => percentageFormatter.format(tp[1].spFumbleNum / tp[1].rollNum)), { indent: true })
                ]} />
                : <InfoBlock>記録なし</InfoBlock>}

            <Heading my="4">ステータス統計</Heading>
            {0 < status.length ?
                <StatTable characters={status.map(tp => tp[0])} data={[
                    Data("合計被ダメージ", status.map(tp => tp[1].totalDamage)),
                    Data("最低HP", status.map(tp => tp[1].minHealth ?? "N/A")),
                    Data("合計喪失SAN", status.map(tp => tp[1].totalLostSAN)),
                    Data("最低SAN", status.map(tp => tp[1].minSAN ?? "N/A"))
                ]} />
                : <InfoBlock>記録なし</InfoBlock>}

            <Heading my="4">SANチェック統計</Heading>
            {0 < sanity.length ?
                <StatTable characters={sanity.map(tp => tp[0])} data={[
                    Data("合計回数", sanity.map(tp => tp[1].rollNum)),
                    Data("成功回数", sanity.map(tp => tp[1].successNum)),
                    Data("失敗回数", sanity.map(tp => tp[1].rollNum - tp[1].successNum)),
                    Data("成功率", sanity.map(tp => tp[1].rollNum == 0 ? "N/A" : percentageFormatter.format(tp[1].successNum / tp[1].rollNum))),
                    Data("クリティカル回数", sanity.map(tp => tp[1].criticalNum), { separate: true }),
                    Data("ファンブル回数", sanity.map(tp => tp[1].fumbleNum))
                ]} />
                : <InfoBlock>記録なし</InfoBlock>}

            <Heading my="4">技能当たりの統計</Heading>
            <Select.Root defaultValue="none" onValueChange={sel => setSkillFinter(sel)}>
                <Select.Trigger />
                <Select.Content>
                    <Select.Group>
                        <Select.Item value="none">未選択</Select.Item>
                        {[...stats.total.skillRoll.perSkill].map(([name,]) => name)
                            .map((skill, i) => <Select.Item key={i} value={skill}>{skill}</Select.Item>)}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
            {skillFilter !== "none" ? <StatTable characters={filteredSkills.map(tp => tp[0])} data={[
                Data("技能振り回数", filteredSkills.map(tp => tp[1].rollNum)),
                Data("平均出目", filteredSkills.map(tp => tp[1].rollNum == 0 ? "N/A" : avgFormatter.format(tp[1].valueSum / tp[1].rollNum))),

                Data("成功数", filteredSkills.map(tp => tp[1].successNum), { separate: true }),
                Data("失敗数", filteredSkills.map(tp => tp[1].failNum)),
                Data("クリティカル数", filteredSkills.map(tp => tp[1].criticalNum)),
                Data("内1クリ", filteredSkills.map(tp => tp[1].spCriticalNum), { indent: true }),
                Data("ファンブル数", filteredSkills.map(tp => tp[1].fumbleNum)),
                Data("内100ファン", filteredSkills.map(tp => tp[1].spFumbleNum), { indent: true }),

                Data("成功率", filteredSkills.map(tp => percentageFormatter.format(tp[1].successNum / tp[1].rollNum)), { separate: true }),
                Data("失敗率", filteredSkills.map(tp => percentageFormatter.format(tp[1].failNum / tp[1].rollNum))),
                Data("クリティカル率", filteredSkills.map(tp => percentageFormatter.format(tp[1].criticalNum / tp[1].rollNum))),
                Data("内1クリ", filteredSkills.map(tp => percentageFormatter.format(tp[1].spCriticalNum / tp[1].rollNum)), { indent: true }),
                Data("ファンブル率", filteredSkills.map(tp => percentageFormatter.format(tp[1].fumbleNum / tp[1].rollNum))),
                Data("内100ファン", filteredSkills.map(tp => percentageFormatter.format(tp[1].spFumbleNum / tp[1].rollNum)), { indent: true })
            ]} /> : null}

            <Heading my="4">会話の統計</Heading>
            {0 < talks.length ?
                <StatTable characters={talks.map(tp => tp[0])} data={[
                    Data("発言数", talks.map(tp => tp[1].talkNum)),
                    Data("発言文字数", talks.map(tp => tp[1].charNum)),
                    Data("平均文字数", talks.map(tp => avgFormatter.format(tp[1].charNum / tp[1].talkNum))),
                    Data("PC発言のみ", talks.map(tp => ""), { separate: true }),
                    Data("発言数", talks.map(tp => tp[1].pcTalkNum), { indent: true }),
                    Data("発言文字数", talks.map(tp => tp[1].pcCharNum), { indent: true }),
                    Data("平均文字数", talks.map(tp => avgFormatter.format(tp[1].pcCharNum / tp[1].pcTalkNum)), { indent: true }),
                    Data("PC発言率", talks.map(tp => percentageFormatter.format(tp[1].pcTalkNum / tp[1].talkNum)), { indent: true }),
                ]} />
                : <InfoBlock>記録なし</InfoBlock>}
        </Box>
    );
}

type StatTableProps = {
    characters: string[],
    data: StatTableData[]
};

type StatTableData = {
    title: string,
    values: (string | number)[],
    indent: boolean,
    separate: boolean
};

const StatTable = (props: StatTableProps) => {
    const config = useContext(configCtx);
    const setConfig = useContext(setConfigCtx);
    const [isNameChanging, setNameChanging] = useState(false);
    const [changingName, setChangingName] = useState(""); // 変更中の名前
    const [changedName, setChangedName] = useState(""); // 変更後の名前

    const addNameAlias = (before: string, after: string) => {
        setConfig(config.withNameAliases(arr => [...arr, [before, after]]));
    }

    const openChangeNameDialog = (name: string) => {
        setChangingName(name);
        setChangedName(name);
        setNameChanging(true);
    }

    return (
        <Flex>
            <Table.Root className='statsTable'>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell className='value_title' justify="center">-</Table.ColumnHeaderCell>
                        {props.characters.map(name =>
                            <>
                                {/*タイトル行:右クリックメニューを付ける*/}
                                <ContextMenu.Root>
                                    <ContextMenu.Trigger>
                                        <Table.ColumnHeaderCell justify="center" onDoubleClick={e => openChangeNameDialog(name)}>
                                            {name}
                                        </Table.ColumnHeaderCell>
                                    </ContextMenu.Trigger>
                                    <ContextMenu.Content>
                                        {/*統合:既存のキャラの記録と統合する*/}
                                        <ContextMenu.Sub>
                                            <ContextMenu.SubTrigger disabled={props.characters.length < 2}>統合</ContextMenu.SubTrigger>
                                            <ContextMenu.SubContent>
                                                {props.characters
                                                    .filter(name2 => name !== name2)
                                                    .map(name2 => <ContextMenu.Item
                                                        key={name2}
                                                        onClick={e => addNameAlias(name, name2)}>
                                                        {name2}
                                                    </ContextMenu.Item>)}
                                            </ContextMenu.SubContent>
                                        </ContextMenu.Sub>

                                        <ContextMenu.Item onClick={e => openChangeNameDialog(name)}>
                                            名前の変更
                                        </ContextMenu.Item>

                                        <ContextMenu.Item color="red" onClick={e => {
                                            addNameAlias(name, "");
                                        }}>
                                            削除
                                        </ContextMenu.Item>
                                    </ContextMenu.Content>
                                </ContextMenu.Root>

                            </>
                        )}
                    </Table.Row >
                </Table.Header>
                <Table.Body>
                    {props.data.map((data, i) => {
                        return (
                            <Table.Row key={`${data.title}-${i}`} className={`${data.indent ? "indent1" : ""} ${data.separate || i === 0 ? "separate" : ""}`}>
                                <Table.RowHeaderCell className='value_title'>{data.title}</Table.RowHeaderCell>
                                {data.values.map((val, i) => <Table.Cell key={`${props.characters[i]}-${data.title}`} justify="end">{val}</Table.Cell>)}
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table.Root>

            {/*名前変更ダイアログ*/}
            <Dialog.Root open={isNameChanging} onOpenChange={value => setNameChanging(value)}>
                <Dialog.Content>
                    <Dialog.Title>名前の変更</Dialog.Title>
                    <Dialog.Description>元の名前: {changingName}</Dialog.Description>
                    <TextField.Root
                        value={changedName}
                        onChange={e => setChangedName(e.target.value)}
                        placeholder='名前'
                    />

                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray">
                                キャンセル
                            </Button>
                        </Dialog.Close>
                        <Dialog.Close>
                            <Button onClick={e => {
                                if (changingName !== changedName) {
                                    addNameAlias(changingName, changedName);
                                }
                            }}>
                                適用
                            </Button>
                        </Dialog.Close>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </Flex>
    )
}

const Data = (title: string, values: (string | number)[], props: { indent?: boolean, separate?: boolean } = {}): StatTableData => {
    return {
        title: title,
        values: values,
        indent: props.indent ?? false,
        separate: props.separate ?? false
    }
}

export default Stats
