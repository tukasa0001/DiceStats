import type { FC } from 'react'
import './App.css'

const Stats: FC = () => {
    return (
        <table>
            <thead>
                <tr>
                    <th>-</th>
                    <th>PC1</th>
                    <th>PC2</th>
                    <th>PC3</th>
                    <th>PC4</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>クリティカル</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                </tr>
                <tr>
                    <td>内1クリ</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                </tr>
                <tr>
                    <td>ファンブル</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                </tr>
                <tr>
                    <td>内100ファン</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                </tr>
            </tbody>
        </table>
    )
}

export default Stats
