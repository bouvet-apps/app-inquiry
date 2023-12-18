<widget>
    <!--Load the AJAX API-->
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script type="text/javascript" defer>
        setTimeout(() => {

            // Load the Visualization API and the corechart package.
            google.charts.load("current", {"packages":["corechart", "bar"]});

            // Set a callback to run when the Google Visualization API is loaded.
            google.charts.setOnLoadCallback(drawChart);

            // Callback
            function drawChart() {
                let data, options, chart;

                <#list chartItems as chartItem>
                <#if (chartItem.type == "piechart")>
                // Create the data table.
                data = new google.visualization.DataTable();
                data.addColumn("string", "<@localize locale="${locale}" key="tool.answer" />");
                data.addColumn("number", "<@localize locale="${locale}" key="tool.count" />");
                data.addRows([
                    <#list chartItem.answers as answer>
                    ["${answer.text}", ${answer.count?c}],
                    </#list>
                ]);

                // Set chart options
                options = {
                    height: ${chartItem.height},
                    is3D: true
                };

                // Instantiate and draw our chart, passing in some options.
                chart = new google.visualization.PieChart(document.getElementById("chart${chartItem?counter}"));
                chart.draw(data, options);
                </#if>

                <#if (chartItem.type == "barchart")>
                // Create the data table.
                data = new google.visualization.DataTable();
                data.addColumn("string", "<@localize locale="${locale}" key="tool.answer" />");
                data.addColumn("number", "<@localize locale="${locale}" key="tool.count" />");
                data.addRows([
                    <#list chartItem.answers as answer>
                    ["${answer.text}", ${answer.count?c}],
                    </#list>
                ]);

                // Set chart options
                options = {
                    bars: "horizontal", // Required for Material Bar Charts.
                    legend: { position: "none" },
                    axes: {
                        x: {
                            0: { side: "top", label: "<@localize locale="${locale}" key="tool.count" />"} // Top x-axis.
                        }
                    },
                    bar: { groupWidth: "90%" }
                };

                // Instantiate and draw our chart, passing in some options.
                chart = new google.charts.Bar(document.getElementById("chart${chartItem?counter}"));
                chart.draw(data, options);
                </#if>
                </#list>
                }

                // Redraw charts on parent resize
                let resizeObserver = new ResizeObserver(entries => {
                    for (let entry of entries) {
                        if (entry.target.id.startsWith('chart')) {
                            drawChart();
                        }
                    }
                });

                // Start observing an element
                <#list chartItems as chartItem>
                resizeObserver.observe(document.getElementById("chart${chartItem?counter}"));
                </#list>

        }, "3000")
    </script>
    <link rel="stylesheet" href="${urlCss}">
    <aside class="inquiry-widget">
        <div class="widget-sidebar">
            <span class="title"><@localize locale="${locale}" key="tool.allInquiries" /></span>
            <#if (inquiryList?size == 0)>
                <div class="no-data"><@localize locale="${locale}" key="tool.noData" /></div>
            <#else>
                <table>
                    <#list inquiryList as inquiry>
                        <#assign activeClass = inquiry.displayed?then('class="active"', '')>
                        <tr>
                            <td>
                                <a href="${urlPage}?id=${inquiry.id}" ${activeClass} onclick="showloader()" title="<@localize locale="${locale}" key="tool.showRepliesFor" /> ${inquiry.name}">${inquiry.name}</a>
                                <span class="replies">${inquiry.count?c} <@localize locale="${locale}" key="tool.replies" /></span>
                            </td>
                            <td style="text-align:right;">
                                <button type="button" onclick="downloadExcelFile('${inquiry.name}', '${inquiry.id}')" title="<@localize locale="${locale}" key="tool.excelTitle" />" class="green">EXCEL</button>
                                <button type="button" onclick="deleteData('${inquiry.name}', '${inquiry.id}')" title="<@localize locale="${locale}" key="tool.deleteTitle" />" class="red">X</button>
                            </td>
                        </tr>
                    </#list>
                </table>
            </#if>
            <div id="loaderInquiry"></div>
            <div id="errorInquiry"></div>
        </div>
        <div class="widget-results">
            <#if (displayedInquiry??)>
                <div class="results__header">
                    <span class="title">${displayedInquiry.name}</span>
                </div>
                <div class="divider--border"></div>
                <div class="widget-results__results-info">
                    <table>
                        <tr>
                            <td><@localize locale="${locale}" key="tool.totalReplies" />:</td>
                            <td>${displayedInquiry.count}</td>
                        </tr>
                        <tr>
                            <td><@localize locale="${locale}" key="tool.firstReply" />:</td>
                            <td>${displayedInquiry.dateFirst}</td>
                        </tr>
                        <tr>
                            <td><@localize locale="${locale}" key="tool.lastReply" />:</td>
                            <td>${displayedInquiry.dateLast}</td>
                        </tr>
                    </table>
                    <div class="widget-results__results-info__buttons">
                        <button type="button" onclick="toggleExpandAll(true)" title="<@localize locale="${locale}" key="tool.toggleOpenAll" />">
                            <strong>Open all</strong>
                        </button>
                        <button type="button" onclick="toggleExpandAll(false)" title="<@localize locale="${locale}" key="tool.toggleCloseAll" />">
                            <strong>Close all</strong>
                        </button>
                    </div>
                </div>
                <div class="divider"></div>
            </#if>
            <#if (chartItems?size == 0)>
                <div class="no-data"><@localize locale="${locale}" key="tool.noData" /></div>
            <#else>
                <#list chartItems as chartItem>
                    <#if (chartItem.type == "piechart" || chartItem.type == "barchart")>
                        <div style="page-break-inside: avoid;">
                            <button id="question${chartItem?counter}" class="question expanded" onclick="toggleExpand(${chartItem?counter})" title="<@localize locale="${locale}" key="tool.toggleTitle" />">
                                <span class="arrow">></span>
                                <strong>${chartItem.title}</strong>
                            </button>
                            <div id="answers${chartItem?counter}" class="widget-answers display">
                                <div id="chart${chartItem?counter}" class="chart" style="height:${chartItem.height}px;"></div>
                            </div>
                        </div>
                    <#else>
                        <button id="question${chartItem?counter}" class="question expanded" onclick="toggleExpand(${chartItem?counter})" title="<@localize locale="${locale}" key="tool.toggleTitle" />">
                            <span class="arrow">></span>
                            <strong>${chartItem.title}</strong>
                        </button>
                        <div id="answers${chartItem?counter}" class="answers display">
                            <#if (chartItem.answers?size == 0)>
                                <div class="no-data"><@localize locale="${locale}" key="tool.noData" /></div>
                            <#else>
                                <ul>
                                    <#list chartItem.answers as answer>
                                        <li>
                                            ${answer.text}
                                        </li>
                                    </#list>
                                </ul>
                            </#if>
                        </div>
                    </#if>
                    <div class="divider"></div>
                </#list>
            </#if>
        </div>
    </aside>
    <!-- XLSX npm lib -->
    <script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script>
    <script type="text/javascript">
        const currentID = "${(displayedInquiry??)?then('${displayedInquiry.id}', '')}";
        const loader = document.getElementById("loaderInquiry");
        const errorBlock = document.getElementById("errorInquiry");
        let openAll = true;
        let enableButtons = true;

        showloader = () => {
            enableButtons = false;
            loader.classList.add("display");
        }

        hideloader = () => {
            enableButtons = true;
            loader.classList.remove("display");
        }

        showError = (error) => {
            errorBlock.textContent = "Error: " + error;
            errorBlock.classList.add("display");
        }

        hideError = () => {
            errorBlock.textContent = "";
            errorBlock.classList.remove("display");
        }

        getOpenAll = () => {
            return openAll;
        }

        toggleExpandAll = (bool) => {
            const numItems = document.getElementsByClassName('question').length;

            for (let i = 1; i <= numItems; i++) {
                if (bool) {
                    document.getElementById("question" + i).classList.add("expanded");
                    document.getElementById("answers" + i).classList.add("display");
                } else {
                    document.getElementById("question" + i).classList.remove("expanded");
                    document.getElementById("answers" + i).classList.remove("display");
                }
            }
        }

        toggleExpand = (number) => {
            const question = document.getElementById("question" + number);
            const answers = document.getElementById("answers" + number);
            if (question.classList.contains("expanded")) {
                question.classList.remove("expanded");
                answers.classList.remove("display");
            } else {
                question.classList.add("expanded");
                answers.classList.add("display");
            }
        }

        downloadExcelFile = (name, id) => {
            if (enableButtons) {
                showloader();
                const url = "${urlPage}?id=" + id + "&action=export-xls";

                fetch(url)
                    .then(res => res.json())
                    .then((body) => {
                        if (body.status === "OK") {
                            const excelSheet = XLSX.utils.json_to_sheet(body.xlsRows);
                            const excelWorkBook = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(excelWorkBook, excelSheet, "Inquiry <@localize locale="${locale}" key="tool.replies" />");
                            XLSX.utils.sheet_add_aoa(excelSheet, [body.xlsHeaders], { origin: "A1" });
                            XLSX.writeFile(excelWorkBook, name + ".xlsx", {});
                            hideError();
                        } else {
                            showError(body.status)
                        }
                    })
                    .catch((error) => showError(error))
                    .finally(() => {
                        setTimeout(function(){
                            hideloader();
                        }, 500);
                    });
            }
        }

        deleteData = (name, id) => {
            if (enableButtons && confirm("<@localize locale="${locale}" key="tool.deleteConfirm" /> " + name + "?") == true) {
                showloader();
                const url = "${urlPage}?id=" + id + "&action=delete";

                fetch(url)
                    .then(res => res.json())
                    .then((body) => {
                        if (body.status === "OK") {
                            hideError();
                            if (currentID === id) {
                                location.href = "${urlPage}";
                            } else {
                                location.href = "${urlPage}?id=" + currentID;
                            }
                        } else {
                            showError(body.status)
                        }
                    })
                    .catch((error) => showError(error))
                    .finally(() => {
                        setTimeout(function(){
                            hideloader();
                        }, 500);
                    });
            }
        }
    </script>
    </widget>
