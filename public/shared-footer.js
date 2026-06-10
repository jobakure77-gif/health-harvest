document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.hh-footer')) {
        return;
    }

    if (!document.getElementById('hh-footer-style')) {
        const style = document.createElement('style');
        style.id = 'hh-footer-style';
        style.textContent = `
            .hh-footer {
                background: #1f2f24;
                color: #f5f7f3;
                margin-top: 48px;
                padding: 48px 20px 24px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .hh-footer-shell {
                max-width: 1200px;
                margin: 0 auto;
            }

            .hh-footer-grid {
                display: grid;
                grid-template-columns: 1.5fr 1fr 1fr;
                gap: 32px;
            }

            .hh-footer-brand {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 1.4rem;
                font-weight: 700;
                margin-bottom: 14px;
            }

            .hh-footer-brand i {
                color: #7bc67e;
            }

            .hh-footer-copy,
            .hh-footer-contact li,
            .hh-footer-links a {
                color: #c7d2c5;
                font-size: 0.96rem;
                line-height: 1.7;
            }

            .hh-footer-title {
                color: #ffffff;
                font-size: 1.05rem;
                font-weight: 700;
                margin-bottom: 14px;
            }

            .hh-footer-links,
            .hh-footer-contact {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .hh-footer-links li,
            .hh-footer-contact li {
                margin-bottom: 10px;
            }

            .hh-footer-links a {
                text-decoration: none;
                transition: color 0.3s ease;
            }

            .hh-footer-links a:hover {
                color: #7bc67e;
            }

            .hh-footer-contact i {
                color: #7bc67e;
                margin-right: 8px;
            }

            .hh-footer-bottom {
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                margin-top: 28px;
                padding-top: 18px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
            }

            .hh-footer-legal {
                display: flex;
                gap: 18px;
                flex-wrap: wrap;
            }

            .hh-footer-legal a {
                color: #c7d2c5;
                text-decoration: none;
                transition: color 0.3s ease;
            }

            .hh-footer-legal a:hover {
                color: #7bc67e;
            }

            @media (max-width: 768px) {
                .hh-footer-grid {
                    grid-template-columns: 1fr;
                    gap: 24px;
                }

                .hh-footer-bottom {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        `;
        document.head.appendChild(style);
    }

    const footerMarkup = `
        <div class="hh-footer-shell">
            <div class="hh-footer-grid">
                <div>
                    <div class="hh-footer-brand">
                        <i class="fas fa-seedling"></i>
                        <span>Healthy Harvest</span>
                    </div>
                    <p class="hh-footer-copy">
                        Smart digital support for farmers, with timely advice, diagnosis, weather insights, and market guidance.
                    </p>
                </div>
                <div>
                    <h3 class="hh-footer-title">Quick Links</h3>
                    <ul class="hh-footer-links">
                        <li><a href="index.html">Home</a></li>
                        <li><a href="dashboard.html">Dashboard</a></li>
                        <li><a href="advice.html">Get Advice</a></li>
                        <li><a href="diagnose.html">Diagnose</a></li>
                        <li><a href="weather.html">Weather</a></li>
                        <li><a href="market.html">Market</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="hh-footer-title">Contact</h3>
                    <ul class="hh-footer-contact">
                        <li><i class="fas fa-envelope"></i> support@healthyharvest.ug</li>
                        <li><i class="fas fa-phone"></i> +256 768 103 829</li>
                        <li><i class="fas fa-map-marker-alt"></i> UICT, Kampala, Uganda</li>
                    </ul>
                </div>
            </div>
            <div class="hh-footer-bottom">
                <div>&copy; 2026 Healthy Harvest. All rights reserved.</div>
                <div class="hh-footer-legal">
                    <a href="Privacy.html">Privacy Policy</a>
                    <a href="Terms of Service.html">Terms of Service</a>
                    <a href="Help Center.html">Help Center</a>
                </div>
            </div>
        </div>
    `;

    let footer = document.querySelector('footer');

    if (!footer) {
        footer = document.createElement('footer');
        document.body.appendChild(footer);
    }

    footer.className = 'hh-footer';
    footer.innerHTML = footerMarkup;
});
