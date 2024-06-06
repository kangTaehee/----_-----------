const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// HTML 파일들이 저장된 디렉토리 경로
const htmlDir = './html-files';

// 검색할 클래스 리스트
const classesToFind = ['hgroup', 'link', 'tac-iframe', 'captchaSet', 'ctrl-prevnext', 'sub-visual', 'lastest', 'jumpoicon', 'ico', 'link-ul', 'jumpoicon-list', 'round-box', 'organization-box', 'agenda-group', 'inner-box', 'chart-table', 'btn-list', 'graph', 'timeline', 'on-off', 'history-mayor', 'root_daum_roughmap', 'row-w100-img', 'img', 'row-w100', 'row', 'f_top_link', 'map-infos', 'map-info', 'dashed-box', 's200565', 'step-list', 'lav', 'flex-row-wrap', 'circle-plus', 'three-list', 'three-list-flex', 'dashed-box-list', 'reservation-result', 'set--wish', 'bd-reservation-list', 'program-1', 'box-agg', 'program-info', 'reg-btn-copy', 'members', 'bade-dong', 'status2', 'tab-cate', 'newsletter', 'waste-flex--box', 'large-waste', 'refund-amount', 'input-width', 'info-windows', 'box-bg', 'ul-box', 'bln', 'market', 'top26', 'ma', 'sms-wrap', 'map_jump_area', 'ys-newsletter', 'fwb', 'ebookinfo', 'ebook-list', 'deptinformain', 'keywordinfo', 'strongMt', 'mqpqpi', 'md:w150', 'link-box-set', 'link-box', 'box_cont', 'box_tit', 'info-box3', 'step-num', 'qrcode-box', 'md:columns-3', 'tourism_tit', 'hp-fax', 'c-GB-12-136', 'col3', 'txt2', 'GB-12-082', 'ico-arr', 'GB-06-032', 'cts_top_temp_tit', 'bot_cts', 'cts10_wrap', 'imgbox', 'ovx-img', 'GB-06-054', 'GB-12-068', 'a4-certificate', 'a4-receipt', 'div-both'];

// 결과를 저장할 CSV 파일 경로
// 현재 시간을 기준으로 파일 이름 생성
const now = new Date();
const formattedTime = now.toISOString().replace(/[:.]/g, '-');
const outputCsvPath = `./results_${formattedTime}.csv`;

// CSV 작성기 설정
const csvWriter = createCsvWriter({
    path: outputCsvPath,
    header: [
        { id: 'className', title: 'Class Name' },
        { id: 'fileList', title: 'File List' }
    ]
});

// 클래스 사용 여부 결과 저장을 위한 객체
const classUsage = {};

// 초기화
classesToFind.forEach(className => {
    classUsage[className] = [];
});

// HTML 파일 목록 불러오기
fs.readdir(htmlDir, (err, files) => {
    if (err) {
        return console.error(`Unable to scan directory: ${err}`);
    }

    // HTML 파일들을 순회하며 클래스 속성 체크
    files.forEach(file => {
        if (path.extname(file) === '.html') {
            const filePath = path.join(htmlDir, file);
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            const $ = cheerio.load(htmlContent);

            // 모든 요소를 검사하여 클래스 속성 확인
            $('*').each((index, element) => {
                const classList = $(element).attr('class');
                if (classList) {
                    const classArray = classList.split(/\s+/);
                    classesToFind.forEach(className => {
                        if (classArray.includes(className)) {
                            if (!classUsage[className].includes(file)) {
                                classUsage[className].push(file);
                            }
                        }
                    });
                }
            });
        }
    });

    // CSV에 저장할 형식으로 결과 변환
    const results = Object.keys(classUsage).map(className => ({
        className: className,
        fileList: classUsage[className].join(', ')
    }));

    // 결과를 CSV 파일로 저장
    csvWriter.writeRecords(results)
        .then(() => {
            console.log('CSV file was written successfully');
        })
        .catch(err => {
            console.error(`Error writing CSV file: ${err}`);
        });
});
