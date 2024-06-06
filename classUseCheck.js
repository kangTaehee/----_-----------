const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// HTML 파일들이 저장된 디렉토리 경로
const htmlDir = 'C:\\work\\gangbukcms\\src\\main\\webapp\\static\\guide';

// 검색할 클래스 리스트
const classesToFind = ['b-steel'];

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

// 재귀적으로 디렉토리를 탐색하여 모든 .html 파일을 찾는 함수
function getAllHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllHtmlFiles(filePath, fileList);
        } else if (path.extname(file) === '.html') {
            fileList.push(filePath);
        }
    });
    return fileList;
}

// 모든 .html 파일 경로 가져오기
const htmlFiles = getAllHtmlFiles(htmlDir);

// HTML 파일들을 순회하며 클래스 속성 체크
htmlFiles.forEach(filePath => {
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(htmlContent);

    // 모든 요소를 검사하여 클래스 속성 확인
    $('*').each((index, element) => {
        const classList = $(element).attr('class');
        if (classList) {
            const classArray = classList.split(/\s+/);
            classesToFind.forEach(className => {
                if (classArray.includes(className)) {
                    const fileName = path.relative(htmlDir, filePath);
                    if (!classUsage[className].includes(fileName)) {
                        classUsage[className].push(fileName);
                    }
                }
            });
        }
    });
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
