
import { ScrollData} from "../components/HelpScroller";
const basePath = process.env.NODE_ENV === 'production' ? '/OleMap' : '';

// in order, not numbered to ward against human error
export const scrollData: ScrollData[] = [
    {
        "description": [
            "Auf der folgenden Karte siehst du alle Umweltkonflikte um Energieressourcenin Abbau, Verarbeitung und Transport von Rohstoffen für die Energiewende, seit 1851 nach dem Global Atlas of Environmental Justice, Stand September 2025.",
         ],

        "stage": 0,
        },{
        "description": [ `Zur Veranschaulichung des sogenannten grünen Extraktivismus (also des Abbaus und Handels von Rohstoffen für die Energiewende, die Umweltbelastungen und Ungleichheiten zwischen ärmeren und reicheren Ländern mit sich bringen) haben wir drei Hauptkategorien ausgewählt, die zusammen die Lieferkette (vom Loch in der Erde über die Fabrik bis hin zur Schiffsverladung im Hafen) abbilden: <br><img src='${basePath}/images/category1.png' alt='Infrastruktur'><br>Spannungen um Anlagen wie Häfen, Bahntrassen, Straßen, Terminals und Pipelines, die für den Rohstofftransport wichtig sind<br><img src='${basePath}/images/category2.png' alt='Industrie und Versorgungsanlagen'><br>Auseinandersetzungen um verarbeitende Betriebe, etwa Raffinerien und Metallhütten, oder Energieversorger<br><img src='${basePath}/images/category3.png' alt='Bergbau & andere Rohstoffaktivitäten'><br>Konflikte rund um die Förderung »kritischer« Rohstoffe wie Lithium, Kobalt, Nickel, Kupfer oder Seltener Erden – einschließlich Transport und Vorverarbeitung`,],
        "stage": 1
        },
    {
        "description": [
            `Ergänzend dazu zeigen diese Farben weitere Nebenkategorien in Bezug auf Energieressourcen.<br><img src='${basePath}/images/category4.png' alt='Fossile Energieträger & Klimagerechtigkeit'><br>Konflikte um Öl, Gas und Kohle sowie um Wind-, Solar- und Geothermieprojekte, die lokale Gemeinschaften beeinträchtigen<br><img src='${basePath}/images/category5.png' alt='Biomasse und Landnutzung'><br>treit um Land, Wälder, Fischerei oder Viehzucht – zum Beispiel durch Plantagen, Holzschlag, Aquakulturen oder Agrarprojekte<br><img src='${basePath}/images/category6.png' alt='Atomkraft'><br>Konflikte um Uranabbau, Kernkraftwerke, Nukleartransporte und Atommüll<br><img src='${basePath}/images/category7.png' alt='Entsorgung von Abfällen'><br>Auseinandersetzungen »nach der Nutzung« – etwa um Elektroschrott, Müllverbrennung oder Deponien`,
        ],

        "stage": 3,
    }
]
