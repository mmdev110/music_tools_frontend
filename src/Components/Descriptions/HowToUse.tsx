import react from 'react'
import { Link } from 'react-router-dom'
import TAILWIND from 'config/tailwind'

const HowToUse = () => {
    return (
        <div>
            <div>
                <Link className={`${TAILWIND.LINK_STYLE}`} to="/edit/new">
                    NEW
                </Link>
                <div className="ml-6">
                    こちらから楽曲の分析を行っていきます。BPMやコード進行、使用楽器や音色を楽曲分析テンプレートに入力します。
                </div>
                <div className="ml-6">
                    またオーディオファイル、midiファイル(準備中)をアップロードし、区間指定して繰り返し聴き込むことができます。
                </div>
                <div className="ml-6">
                    会員登録することで入力したデータを保存することができます。
                </div>
            </div>
            <div>
                <Link className={`${TAILWIND.LINK_STYLE}`} to="/list">
                    LIST
                </Link>
                <div className="ml-6">
                    これまでに分析した楽曲のリストを表示します。(※要会員登録)
                </div>
            </div>
            <div>
                <Link className={`${TAILWIND.LINK_STYLE}`} to="/build">
                    BUILD
                </Link>
                <div className="ml-6">
                    これまでに分析した楽曲を参考にしながら、作りたい曲のテンプレートを入力します。
                </div>
            </div>
            <div>
                <Link className={`${TAILWIND.LINK_STYLE}`} to="/other_tools">
                    TOOLS
                </Link>
                <div className="ml-6">
                    その他楽曲制作時に役立つようなツールや表を置いています。
                </div>
            </div>
        </div>
    )
}
export default HowToUse
